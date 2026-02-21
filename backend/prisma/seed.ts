import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Fleet123', 10);

  await Promise.all([
    prisma.user.upsert({
      where: { email: 'manager@fleet.com' },
      update: {},
      create: { email: 'manager@fleet.com', password: hash, role: 'MANAGER' },
    }),
    prisma.user.upsert({
      where: { email: 'dispatch@fleet.com' },
      update: {},
      create: { email: 'dispatch@fleet.com', password: hash, role: 'DISPATCHER' },
    }),
    prisma.user.upsert({
      where: { email: 'safety@fleet.com' },
      update: {},
      create: { email: 'safety@fleet.com', password: hash, role: 'SAFETY_OFFICER' },
    }),
    prisma.user.upsert({
      where: { email: 'mohit@fleet.com' },
      update: {},
      create: { email: 'mohit@fleet.com', password: hash, role: 'MANAGER' },
    }),
  ]);

  const plates = ['TRK-4821', 'VAN-2934', 'TRK-7753', 'LGT-1102', 'TRK-6614'];
  const vehicles = await Promise.all(
    [
      { name: 'Titan Hauler', licensePlate: 'TRK-4821', maxCapacity: 15000, odometer: 142500, type: 'Heavy Truck', status: 'Available' as const },
      { name: 'Swift Runner', licensePlate: 'VAN-2934', maxCapacity: 3500, odometer: 67200, type: 'Van', status: 'Available' as const },
      { name: 'Iron Stallion', licensePlate: 'TRK-7753', maxCapacity: 20000, odometer: 310000, type: 'Heavy Truck', status: 'InShop' as const },
      { name: 'City Drifter', licensePlate: 'LGT-1102', maxCapacity: 1200, odometer: 28900, type: 'Light Truck', status: 'Available' as const },
      { name: 'Road Monarch', licensePlate: 'TRK-6614', maxCapacity: 18000, odometer: 198400, type: 'Heavy Truck', status: 'Available' as const },
    ].map(async (v) => {
      const existing = await prisma.vehicle.findFirst({ where: { licensePlate: v.licensePlate } });
      if (existing) return existing;
      return prisma.vehicle.create({
        data: { ...v, acquisitionCost: 0 },
      });
    })
  );

  const driversData = [
    { name: 'Marcus Rivera', licenseNumber: 'CDL-MR-7821', licenseExpiry: new Date('2026-08-15'), status: 'OnDuty' as const, safetyScore: 89 },
    { name: 'Priya Sharma', licenseNumber: 'CDL-PS-3340', licenseExpiry: new Date('2025-11-30'), status: 'OnDuty' as const, safetyScore: 91 },
    { name: "Jake O'Brien", licenseNumber: 'CDL-JO-5512', licenseExpiry: new Date('2026-03-01'), status: 'OffDuty' as const, safetyScore: 62 },
    { name: 'Amara Osei', licenseNumber: 'CDL-AO-9901', licenseExpiry: new Date('2027-05-20'), status: 'OnDuty' as const, safetyScore: 97 },
  ];
  const drivers = await Promise.all(
    driversData.map(async (d) => {
      const existing = await prisma.driver.findFirst({ where: { licenseNumber: d.licenseNumber } });
      if (existing) return existing;
      return prisma.driver.create({ data: d });
    })
  );

  const [v1, v2, v3, v4, v5] = vehicles;
  const [d1, d2, d3, d4] = drivers;

  const tripCount = await prisma.trip.count();
  if (tripCount === 0) {
    await prisma.trip.createMany({
      data: [
        { vehicleId: v1.id, driverId: d1.id, cargoWeight: 12000, revenue: 45000, startOdo: 142500, endOdo: 142956, origin: 'Chicago, IL', destination: 'Detroit, MI', distance: 456, scheduledDate: new Date('2025-02-21'), status: 'Dispatched' },
        { vehicleId: v2.id, driverId: d2.id, cargoWeight: 2800, revenue: 18000, startOdo: 67200, endOdo: 67411, origin: 'Nashville, TN', destination: 'Memphis, TN', distance: 211, scheduledDate: new Date('2025-02-16'), status: 'Completed' },
        { vehicleId: v4.id, driverId: d4.id, cargoWeight: 950, revenue: 22000, startOdo: 28900, origin: 'Atlanta, GA', destination: 'Charlotte, NC', distance: 437, scheduledDate: new Date('2025-02-23'), status: 'Draft' },
      ],
    });
  }

  const maintenanceCount = await prisma.maintenanceLog.count();
  if (maintenanceCount === 0) {
    await prisma.maintenanceLog.createMany({
      data: [
        { vehicleId: v1.id, cost: 10000, issue: 'Engine Issue', serviceDate: new Date('2025-02-20') },
        { vehicleId: v3.id, cost: 45000, issue: 'Engine Overhaul', serviceDate: new Date('2025-02-18') },
        { vehicleId: v2.id, cost: 2500, issue: 'Tire Rotation', serviceDate: new Date('2025-02-15') },
        { vehicleId: v5.id, cost: 8000, issue: 'Brake Inspection', serviceDate: new Date('2025-02-22') },
        { vehicleId: v4.id, cost: 1500, issue: 'Oil Change', serviceDate: new Date('2025-02-10') },
      ],
    });
  }

  const expenseCount = await prisma.expense.count();
  if (expenseCount === 0) {
    await prisma.expense.createMany({
      data: [
        { vehicleId: v1.id, amount: 19000 },
        { vehicleId: v2.id, amount: 8500 },
        { vehicleId: v4.id, amount: 15000 },
      ],
    });
  }

  const fuelCount = await prisma.fuelLog.count();
  if (fuelCount === 0) {
    await prisma.fuelLog.createMany({
      data: [
        { vehicleId: v1.id, liters: 100, cost: 8500 },
        { vehicleId: v2.id, liters: 25, cost: 2100 },
        { vehicleId: v4.id, liters: 35, cost: 3000 },
      ],
    });
  }

  console.log('Seed completed: users 4, vehicles', vehicles.length, 'drivers', drivers.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
