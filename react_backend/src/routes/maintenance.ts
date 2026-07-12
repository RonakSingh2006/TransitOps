import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authMiddleware } from "../lib/auth";

const router = Router();
router.use(authMiddleware);

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  serviceType: z.string().min(1),
  cost: z.string().min(1),
  date: z.string().min(1),
  status: z.string().optional(),
});

// GET all maintenance records
router.get("/", async (_req, res) => {
  const records = await prisma.maintenance.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(records);
});

// POST create maintenance (auto-sets vehicle to "in_shop")
router.post("/", async (req, res) => {
  try {
    const data = maintenanceSchema.parse(req.body);

    // Check vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) { res.status(404).json({ error: "Vehicle not found" }); return; }

    // Create maintenance record
    const record = await prisma.maintenance.create({
      data: { ...data, status: data.status || "Active" } as any,
      include: { vehicle: true },
    });

    // Auto-set vehicle status to "in_shop" (unless retired)
    if (vehicle.status !== "retired") {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: "in_shop" },
      });
    }

    // Return updated record with fresh vehicle status
    const updated = await prisma.maintenance.findUnique({
      where: { id: record.id },
      include: { vehicle: true },
    });
    res.status(201).json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT close maintenance (restores vehicle to "available" unless retired)
router.put("/:id/close", async (req, res) => {
  try {
    const record = await prisma.maintenance.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true },
    });
    if (!record) { res.status(404).json({ error: "Maintenance record not found" }); return; }

    // Close the record
    await prisma.maintenance.update({
      where: { id: req.params.id },
      data: { status: "Completed" },
    });

    // Restore vehicle to available (unless retired)
    if (record.vehicle && record.vehicle.status !== "retired") {
      await prisma.vehicle.update({
        where: { id: record.vehicleId },
        data: { status: "available" },
      });
    }

    const updated = await prisma.maintenance.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update maintenance
router.put("/:id", async (req, res) => {
  try {
    const data = maintenanceSchema.partial().parse(req.body);
    const record = await prisma.maintenance.update({
      where: { id: req.params.id },
      data,
      include: { vehicle: true },
    });
    res.json(record);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;