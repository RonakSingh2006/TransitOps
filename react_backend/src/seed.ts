import prisma from "./lib/prisma";
import { hashPassword } from "./lib/auth";

async function main() {
  console.log("🌱 Seeding TransitOps database...");

  // Create default users (all roles)
  const password = await hashPassword("password123");

  const users = [
    { email: "fleet@transitops.in", password, name: "Raven K.", role: "Fleet_Manager" as const },
    { email: "dispatcher@transitops.in", password, name: "Sam D.", role: "Dispatcher" as const },
    { email: "safety@transitops.in", password, name: "Tina R.", role: "Safety_Officer" as const },
    { email: "finance@transitops.in", password, name: "Mira L.", role: "Financial_Analyst" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }
  console.log("✅ Users created (fleet@transitops.in / password123)");

  // Create vehicles with real UUIDs for reference
  const v1 = await prisma.vehicle.upsert({
    where: { registration: "GJ01AB4521" },
    update: {},
    create: { registration: "GJ01AB4521", model: "VAN-05", type: "Van", maxCapacity: "500 kg", odometer: "74,000", acquisitionCost: "6,20,000", status: "available" },
  });
  const v2 = await prisma.vehicle.upsert({
    where: { registration: "GJ01AB9981" },
    update: {},
    create: { registration: "GJ01AB9981", model: "TRUCK-11", type: "Truck", maxCapacity: "5 Ton", odometer: "1,82,000", acquisitionCost: "24,50,000", status: "on_trip" },
  });
  const v3 = await prisma.vehicle.upsert({
    where: { registration: "GJ01AB1120" },
    update: {},
    create: { registration: "GJ01AB1120", model: "MINI-03", type: "Mini", maxCapacity: "1 Ton", odometer: "66,000", acquisitionCost: "4,10,000", status: "in_shop" },
  });
  const v4 = await prisma.vehicle.upsert({
    where: { registration: "GJ01AB0008" },
    update: {},
    create: { registration: "GJ01AB0008", model: "VAN-09", type: "Van", maxCapacity: "750 kg", odometer: "2,41,900", acquisitionCost: "5,90,000", status: "retired" },
  });
  console.log("✅ Vehicles created");

  // Create drivers
  const d1 = await prisma.driver.upsert({
    where: { licenseNo: "DL-88213" },
    update: {},
    create: { name: "Alex", licenseNo: "DL-88213", category: "LMV", licenseExpiry: "12/2028", phone: "98765xxxxx", tripRate: "96%", safetyScore: 9.2, safetyTone: "green", status: "available" },
  });
  const d2 = await prisma.driver.upsert({
    where: { licenseNo: "DL-44120" },
    update: {},
    create: { name: "John", licenseNo: "DL-44120", category: "HMV", licenseExpiry: "03/2025 EXPIRED", phone: "98220xxxxx", tripRate: "81%", safetyScore: 7.1, safetyTone: "amber", status: "suspended" },
  });
  const d3 = await prisma.driver.upsert({
    where: { licenseNo: "DL-77031" },
    update: {},
    create: { name: "Priya", licenseNo: "DL-77031", category: "LMV", licenseExpiry: "08/2029", phone: "99110xxxxx", tripRate: "99%", safetyScore: 9.8, safetyTone: "green", status: "on_trip" },
  });
  const d4 = await prisma.driver.upsert({
    where: { licenseNo: "DL-90045" },
    update: {},
    create: { name: "Suresh", licenseNo: "DL-90045", category: "HMV", licenseExpiry: "01/2027", phone: "97440xxxxx", tripRate: "88%", safetyScore: 8.4, safetyTone: "gray", status: "off_duty" },
  });
  console.log("✅ Drivers created");

  // Create trips
  await prisma.trip.upsert({
    where: { tripCode: "TR001" },
    update: {},
    create: { tripCode: "TR001", sourceDepot: "Gandhinagar Depot", destinationHub: "Ahmedabad Hub", cargoWeight: 400, plannedDistance: 38, eta: "45 min", status: "dispatched", vehicleId: v1.id, driverId: d1.id },
  });
  await prisma.trip.upsert({
    where: { tripCode: "TR002" },
    update: {},
    create: { tripCode: "TR002", sourceDepot: "Vatva Industrial Area", destinationHub: "Sanand Warehouse", cargoWeight: 3000, plannedDistance: 85, status: "completed", vehicleId: v2.id, driverId: d2.id },
  });
  await prisma.trip.upsert({
    where: { tripCode: "TR003" },
    update: {},
    create: { tripCode: "TR003", sourceDepot: "Gandhinagar Depot", destinationHub: "Kalol Depot", cargoWeight: 250, plannedDistance: 22, eta: "1h 10m", status: "dispatched", vehicleId: v1.id, driverId: d3.id },
  });
  await prisma.trip.upsert({
    where: { tripCode: "TR004" },
    update: {},
    create: { tripCode: "TR004", sourceDepot: "Mansa", destinationHub: "Kalol Depot", status: "draft" },
  });
  console.log("✅ Trips created");

  // Fuel entries
  await prisma.fuelEntry.create({ data: { vehicleId: v1.id, date: "05 Jul 2026", liters: "42 L", cost: "3,150" } });
  await prisma.fuelEntry.create({ data: { vehicleId: v2.id, date: "06 Jul 2026", liters: "110 L", cost: "8,400" } });
  console.log("✅ Fuel entries created");

  // Maintenance
  await prisma.maintenance.create({ data: { vehicleId: v1.id, serviceType: "Oil Change", cost: "2,500", date: "06 Jul 2026" } });
  await prisma.maintenance.create({ data: { vehicleId: v2.id, serviceType: "Engine Repair", cost: "18,000", date: "03 Jul 2026", status: "Completed" } });
  console.log("✅ Maintenance records created");

  console.log("\n🎉 Seeding complete!");
  console.log("   Login: fleet@transitops.in / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());