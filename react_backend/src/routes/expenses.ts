import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authMiddleware } from "../lib/auth";

const router = Router();
router.use(authMiddleware);

const expenseSchema = z.object({
  tripId: z.string().min(1),
  vehicleId: z.string().min(1),
  toll: z.string().optional().default("0"),
  misc: z.string().optional().default("0"),
  maint: z.string().optional().default("0"),
});

router.get("/", async (_req, res) => {
  const expenses = await prisma.expense.findMany({
    include: { trip: true, vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(expenses);
});

router.post("/", async (req, res) => {
  try {
    const data = expenseSchema.parse(req.body);
    const toll = parseInt(data.toll) || 0;
    const misc = parseInt(data.misc) || 0;
    const maint = parseInt(data.maint) || 0;
    const total = (toll + misc + maint).toString();
    const expense = await prisma.expense.create({
      data: { ...data, total } as any,
      include: { trip: true, vehicle: true },
    });
    res.status(201).json(expense);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;