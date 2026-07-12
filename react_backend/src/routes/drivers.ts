import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authMiddleware } from "../lib/auth";

const router = Router();
router.use(authMiddleware);

const driverSchema = z.object({
  name: z.string().min(1),
  licenseNo: z.string().min(1),
  category: z.string().min(1),
  licenseExpiry: z.string().min(1),
  phone: z.string().min(1),
});

router.get("/", async (_req, res) => {
  const drivers = await prisma.driver.findMany({ orderBy: { createdAt: "desc" } });
  res.json(drivers);
});

router.get("/:id", async (req, res) => {
  const driver = await prisma.driver.findUnique({ where: { id: req.params.id } });
  if (!driver) { res.status(404).json({ error: "Driver not found" }); return; }
  res.json(driver);
});

router.post("/", async (req, res) => {
  try {
    const data = driverSchema.parse(req.body);
    const driver = await prisma.driver.create({ data: data as any });
    res.status(201).json(driver);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    if ((err as any)?.code === "P2002") { res.status(409).json({ error: "License number already exists" }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const data = driverSchema.partial().parse(req.body);
    const driver = await prisma.driver.update({ where: { id: req.params.id }, data });
    res.json(driver);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: "Validation error", details: err.errors }); return; }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;