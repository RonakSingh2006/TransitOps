import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../lib/auth";

const router = Router();
router.use(authMiddleware);

// GET /api/analytics/reports — Full analytics data
router.get("/reports", async (_req, res) => {
  try {
    const [vehicles, trips, fuelEntries, maintenanceRecords] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.trip.findMany({
        where: { status: "completed" },
        include: { expenses: true },
      }),
      prisma.fuelEntry.findMany(),
      prisma.maintenance.findMany(),
    ]);

    // Total fuel cost
    const totalFuelCost = fuelEntries.reduce(
      (acc: number, f) => acc + (parseInt(f.cost.replace(/,/g, "")) || 0),
      0
    );

    // Total maintenance cost from maintenance records
    const totalMaintCostFromRecords = maintenanceRecords.reduce(
      (acc: number, m) => acc + (parseInt(m.cost.replace(/,/g, "")) || 0),
      0
    );

    // Total expense maintenance
    const totalExpenseMaint = trips.reduce((acc: number, t) => {
      return acc + t.expenses.reduce((s: number, e) => s + (parseInt(e.maint.replace(/,/g, "")) || 0), 0);
    }, 0);

    // Fleet counts
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "on_trip").length;
    const availableVehicles = vehicles.filter((v) => v.status === "available").length;
    const inShopVehicles = vehicles.filter((v) => v.status === "in_shop").length;
    const retiredVehicles = vehicles.filter((v) => v.status === "retired").length;

    // Fleet utilization
    const nonRetired = totalVehicles - retiredVehicles;
    const fleetUtilization = nonRetired > 0
      ? Math.round(((activeVehicles + availableVehicles) / nonRetired) * 100)
      : 0;

    // Total operational cost
    const totalOpCost = totalFuelCost + totalExpenseMaint + totalMaintCostFromRecords;

    // Fuel efficiency
    const completedWithDist = trips.filter((t) => (t.plannedDistance ?? 0) > 0);
    const totalDist = completedWithDist.reduce((acc: number, t) => acc + (t.plannedDistance ?? 0), 0);
    const totalFuelLiters = fuelEntries.reduce(
      (acc: number, f) => acc + (parseInt(f.liters.replace(/[^0-9]/g, "")) || 0),
      0
    );
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDist / totalFuelLiters).toFixed(1) : "0";

    // Vehicle ROI per vehicle
    const vehicleROIs = vehicles.map((v) => {
      const vehicleTrips = trips.filter((t) => t.vehicleId === v.id);
      const revenue = vehicleTrips.length * 5000;
      const vehicleFuel = fuelEntries
        .filter((f) => f.vehicleId === v.id)
        .reduce((acc: number, f) => acc + (parseInt(f.cost.replace(/,/g, "")) || 0), 0);
      const vehicleMaint = maintenanceRecords
        .filter((m) => m.vehicleId === v.id)
        .reduce((acc: number, m) => acc + (parseInt(m.cost.replace(/,/g, "")) || 0), 0);
      const acqCost = parseInt(v.acquisitionCost.replace(/,/g, "")) || 1;
      const roi = ((revenue - (vehicleFuel + vehicleMaint)) / acqCost) * 100;
      return { model: v.model, registration: v.registration, roi: roi.toFixed(1) };
    });

    const avgROI = vehicleROIs.length > 0
      ? (vehicleROIs.reduce((acc: number, r) => acc + parseFloat(r.roi), 0) / vehicleROIs.length).toFixed(1)
      : "0";

    res.json({
      kpis: [
        { label: "Fuel Efficiency", value: `${fuelEfficiency} km/l`, accent: "text-status-active" },
        { label: "Fleet Utilization", value: `${fleetUtilization}%`, accent: "text-status-available" },
        { label: "Total Operational Cost", value: `₹ ${totalOpCost.toLocaleString("en-IN")}`, accent: "text-status-warning" },
        { label: "Vehicle ROI", value: `${avgROI}%`, accent: "text-primary" },
      ],
      revenue: [
        { m: "Jan", v: 48 }, { m: "Feb", v: 62 }, { m: "Mar", v: 55 },
        { m: "Apr", v: 78 }, { m: "May", v: 71 }, { m: "Jun", v: 88 }, { m: "Jul", v: 95 },
      ],
      costliestAssets: vehicleROIs
        .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi))
        .slice(0, 5),
      totalVehicles,
      fleetDistribution: [
        { label: "Available", pct: nonRetired > 0 ? Math.round((availableVehicles / nonRetired) * 100) : 0, cls: "bg-status-available" },
        { label: "On Trip", pct: nonRetired > 0 ? Math.round((activeVehicles / nonRetired) * 100) : 0, cls: "bg-status-active" },
        { label: "In Shop", pct: nonRetired > 0 ? Math.round((inShopVehicles / nonRetired) * 100) : 0, cls: "bg-status-warning" },
        { label: "Retired", pct: totalVehicles > 0 ? Math.round((retiredVehicles / totalVehicles) * 100) : 0, cls: "bg-status-danger/60" },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/analytics/export/csv — CSV export
router.get("/export/csv", async (_req, res) => {
  try {
    const [vehicles, trips, fuelEntries] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.trip.findMany({ where: { status: "completed" }, include: { expenses: true } }),
      prisma.fuelEntry.findMany(),
    ]);

    const rows: string[] = [
      "Vehicle,Registration,Total Trips,Total Fuel Cost (₹),Total Maint Cost (₹),Acquisition Cost (₹),ROI (%)",
    ];

    for (const v of vehicles) {
      const vehicleTrips = trips.filter((t) => t.vehicleId === v.id);
      const totalTrips = vehicleTrips.length;
      const fuelCost = fuelEntries
        .filter((f) => f.vehicleId === v.id)
        .reduce((acc: number, f) => acc + (parseInt(f.cost.replace(/,/g, "")) || 0), 0);
      const maintCost = vehicleTrips.reduce((acc: number, t) => {
        return acc + t.expenses.reduce((s: number, e) => s + (parseInt(e.maint.replace(/,/g, "")) || 0), 0);
      }, 0);
      const acqCost = parseInt(v.acquisitionCost.replace(/,/g, "")) || 1;
      const revenue = totalTrips * 5000;
      const roi = (((revenue - (fuelCost + maintCost)) / acqCost) * 100).toFixed(1);
      rows.push(`"${v.model}","${v.registration}",${totalTrips},${fuelCost},${maintCost},${acqCost},${roi}`);
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transitops-analytics.csv");
    res.send(rows.join("\n"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;