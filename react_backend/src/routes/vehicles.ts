import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authMiddleware } from "../lib/auth";

const router = Router();
router.use(authMiddleware);

const vehicleSchema = z.object({
  registration: z.string().min(1),
  model: z.string().min(1),
  type: z.string().min(1),
  maxCapacity: z.string().min(1),
  odometer: z.string().min(1),
  acquisitionCost: z.string().min(1),
  status: z.enum(["available", "on_trip", "in_shop", "retired"]).optional(),
});

router.get("/", async (_req, res) => {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });
  res.json(vehicles);
});

router.get("/:id", async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) { res.status(404).json({ error: "Vehicle not found" }); return; }
  res.json(vehicle);
});

router.post("/", async (req, res) => {
  try {
    const data = vehicleSchema.parse(req.body);
    const vehicle = await prisma.vehicle.create({ data: data as any });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = vehicleSchema.partial().parse(req.body);
    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data });
    res.json(vehicle);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;