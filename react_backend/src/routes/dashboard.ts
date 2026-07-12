import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../lib/auth";

const router = Router();
router.use(authMiddleware);

router.get("/stats", async (_req, res) => {
  try {
    const [activeVehicles, availableVehicles, inMaintenance, totalTrips, activeTrips, pendingTrips, driversOnDuty, totalDrivers] =
      await Promise.all([
        prisma.vehicle.count({ where: { status: "on_trip" } }),
        prisma.vehicle.count({ where: { status: "available" } }),
        prisma.vehicle.count({ where: { status: "in_shop" } }),
        prisma.trip.count(),
        prisma.trip.count({ where: { status: "dispatched" } }),
        prisma.trip.count({ where: { status: "draft" } }),
        prisma.driver.count({ where: { status: "on_trip" } }),
        prisma.driver.count(),
      ]);

    const fleetDist = [
      { label: "Available", pct: Math.round((availableVehicles / Math.max(1, activeVehicles + availableVehicles + inMaintenance)) * 60), cls: "bg-status-available" },
      { label: "On Trip", pct: Math.round((activeVehicles / Math.max(1, totalTrips)) * 30), cls: "bg-status-active" },
      { label: "In Shop", pct: inMaintenance * 4, cls: "bg-status-warning" },
      { label: "Retired", pct: 2, cls: "bg-status-danger/60" },
    ];

    res.json({
      kpis: [
        { label: "Active Vehicles", value: String(activeVehicles), accent: "bg-status-active" },
        { label: "Available Vehicles", value: String(availableVehicles), accent: "bg-status-available" },
        { label: "In Maintenance", value: String(inMaintenance).padStart(2, "0"), accent: "bg-status-warning" },
        { label: "Active Trips", value: String(activeTrips), accent: "bg-status-active" },
        { label: "Pending Trips", value: String(pendingTrips).padStart(2, "0"), accent: "bg-status-neutral" },
        { label: "Drivers On Duty", value: String(driversOnDuty), accent: "bg-primary" },
      ],
      fleetUtilization: Math.round(((activeVehicles + availableVehicles) / Math.max(1, activeVehicles + availableVehicles + inMaintenance)) * 100),
      totalAssets: activeVehicles + availableVehicles + inMaintenance,
      fleetDistribution: fleetDist,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;