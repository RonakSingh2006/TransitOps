import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authMiddleware } from "../lib/auth";

const router = Router();
router.use(authMiddleware);

// ── Helpers ──

async function validateVehicleForDispatch(vehicleId: string, cargoWeight: number): Promise<string | null> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return "Vehicle not found";
  if (vehicle.status === "retired") return "Retired vehicles cannot be dispatched";
  if (vehicle.status === "in_shop") return "Vehicles in shop cannot be dispatched";
  if (vehicle.status === "on_trip") return "Vehicle is already on a trip";
  // Cargo weight validation
  const capNum = parseInt(vehicle.maxCapacity.replace(/[^0-9]/g, ""));
  if (!isNaN(capNum) && cargoWeight > capNum) {
    return `Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity (${vehicle.maxCapacity})`;
  }
  return null;
}

async function validateDriverForDispatch(driverId: string): Promise<string | null> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) return "Driver not found";
  if (driver.status === "suspended") return "Suspended drivers cannot be assigned";
  if (driver.status === "on_trip") return "Driver is already on a trip";
  // Check expired license
  const expiryStr = driver.licenseExpiry;
  if (expiryStr && expiryStr.includes("EXPIRED")) return "Driver has an expired license";
  // Parse MM/YYYY
  const match = expiryStr.match(/^(\d{2})\/(\d{4})/);
  if (match) {
    const expDate = new Date(parseInt(match[2]), parseInt(match[1]));
    if (expDate < new Date()) return "Driver license has expired";
  }
  return null;
}

// ── Schemas ──

const createTripSchema = z.object({
  tripCode: z.string().min(1),
  sourceDepot: z.string().min(1),
  destinationHub: z.string().min(1),
  cargoWeight: z.number().int().optional(),
  plannedDistance: z.number().int().optional(),
  vehicleId: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
  status: z.enum(["draft", "dispatched", "completed", "cancelled"]).optional(),
});

const dispatchSchema = z.object({
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
});

// ── Routes ──

// GET all trips
router.get("/", async (_req, res) => {
  const trips = await prisma.trip.findMany({
    include: { vehicle: true, driver: true, expenses: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(trips);
});

// GET available vehicles for dispatch (not retired, not in_shop, not on_trip)
router.get("/available-vehicles", async (_req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: { notIn: ["retired", "in_shop", "on_trip"] } },
    orderBy: { model: "asc" },
  });
  res.json(vehicles);
});

// GET available drivers for dispatch (not suspended, not on_trip, license valid)
router.get("/available-drivers", async (_req, res) => {
  const drivers = await prisma.driver.findMany({
    where: { status: { notIn: ["suspended", "on_trip"] } },
    orderBy: { name: "asc" },
  });
  // Filter out expired licenses in application layer
  const now = new Date();
  const valid = drivers.filter((d: { licenseExpiry: string }) => {
    const m = d.licenseExpiry.match(/^(\d{2})\/(\d{4})/);
    if (!m) return true;
    return new Date(parseInt(m[2]), parseInt(m[1])) >= now;
  });
  res.json(valid);
});

// GET single trip
router.get("/:id", async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: { vehicle: true, driver: true, expenses: true },
  });
  if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }
  res.json(trip);
});

// POST create draft trip
router.post("/", async (req, res) => {
  try {
    const data = createTripSchema.parse(req.body);
    const trip = await prisma.trip.create({
      data: { ...data, status: data.status || "draft" } as any,
      include: { vehicle: true, driver: true },
    });
    res.status(201).json(trip);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    if ((err as any)?.code === "P2002") { res.status(409).json({ error: "Trip code already exists" }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST dispatch a trip (status draft → dispatched with business rules)
router.post("/:id/dispatch", async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }
    if (trip.status !== "draft") { res.status(400).json({ error: "Only draft trips can be dispatched" }); return; }

    const data = dispatchSchema.parse(req.body);

    // Validate vehicle
    const vehicleErr = await validateVehicleForDispatch(data.vehicleId, trip.cargoWeight ?? 0);
    if (vehicleErr) { res.status(400).json({ error: vehicleErr }); return; }

    // Validate driver
    const driverErr = await validateDriverForDispatch(data.driverId);
    if (driverErr) { res.status(400).json({ error: driverErr }); return; }

    // Update vehicle & driver status to on_trip
    await Promise.all([
      prisma.vehicle.update({ where: { id: data.vehicleId }, data: { status: "on_trip" } }),
      prisma.driver.update({ where: { id: data.driverId }, data: { status: "on_trip" } }),
    ]);

    // Update trip
    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: { vehicleId: data.vehicleId, driverId: data.driverId, status: "dispatched" },
      include: { vehicle: true, driver: true, expenses: true },
    });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST complete a trip
router.post("/:id/complete", async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true, driver: true },
    });
    if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }
    if (trip.status !== "dispatched") { res.status(400).json({ error: "Only dispatched trips can be completed" }); return; }

    // Restore vehicle & driver to available
    if (trip.vehicleId) {
      await prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "available" } });
    }
    if (trip.driverId) {
      await prisma.driver.update({ where: { id: trip.driverId }, data: { status: "available" } });
    }

    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: { status: "completed" },
      include: { vehicle: true, driver: true, expenses: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST cancel a trip
router.post("/:id/cancel", async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true, driver: true },
    });
    if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }
    if (trip.status === "completed") { res.status(400).json({ error: "Completed trips cannot be cancelled" }); return; }

    // Restore vehicle & driver if they were on_trip
    if (trip.vehicleId && trip.vehicle?.status === "on_trip") {
      await prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "available" } });
    }
    if (trip.driverId && trip.driver?.status === "on_trip") {
      await prisma.driver.update({ where: { id: trip.driverId }, data: { status: "available" } });
    }

    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: { status: "cancelled" },
      include: { vehicle: true, driver: true, expenses: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update trip (general)
router.put("/:id", async (req, res) => {
  try {
    const data = createTripSchema.partial().parse(req.body);
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data,
      include: { vehicle: true, driver: true, expenses: true },
    });
    res.json(trip);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;