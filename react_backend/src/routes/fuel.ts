import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authMiddleware } from "../lib/auth";

const router = Router();
router.use(authMiddleware);

const fuelSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().min(1),
  liters: z.string().min(1),
  cost: z.string().min(1),
});

router.get("/", async (_req, res) => {
  const entries = await prisma.fuelEntry.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(entries);
});

router.post("/", async (req, res) => {
  try {
    const data = fuelSchema.parse(req.body);
    const entry = await prisma.fuelEntry.create({ data: data as any, include: { vehicle: true } });
    res.status(201).json(entry);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;