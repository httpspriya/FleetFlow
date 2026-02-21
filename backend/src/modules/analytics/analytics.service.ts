import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TripStatus } from '../../core/prisma/enums';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async fuelEfficiencyPerVehicle() {
    const vehicles = await this.prisma.vehicle.findMany({
      include: { trips: true, fuelLogs: true },
    });

    return vehicles.map((v) => {
      const completedTrips = v.trips.filter((t) => t.status === TripStatus.Completed);
      const totalDistance = completedTrips.reduce(
        (sum, t) => sum + ((t.endOdo ?? 0) - t.startOdo),
        0,
      );
      const totalLiters = v.fuelLogs.reduce((sum, f) => sum + f.liters, 0);
      const efficiency = totalLiters > 0 ? totalDistance / totalLiters : null;

      return {
        vehicleId: v.id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        totalDistanceKm: totalDistance,
        totalLiters,
        fuelEfficiencyKmPerLiter: efficiency ? parseFloat(efficiency.toFixed(2)) : null,
      };
    });
  }

  async roiPerVehicle() {
    const vehicles = await this.prisma.vehicle.findMany({
      include: {
        trips: true,
        expenses: true,
        maintenanceLogs: true,
        fuelLogs: true,
      },
    });

    return vehicles.map((v) => {
      const totalRevenue = v.trips
        .filter((t) => t.status === TripStatus.Completed)
        .reduce((sum, t) => sum + Number(t.revenue), 0);

      const fuelCost = v.fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);
      const otherExpenses = v.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const totalCost = fuelCost + maintenanceCost + otherExpenses;
      const acquisitionCostNum = Number(v.acquisitionCost);

      const roi =
        acquisitionCostNum > 0
          ? ((totalRevenue - totalCost) / acquisitionCostNum) * 100
          : null;

      return {
        vehicleId: v.id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        acquisitionCost: v.acquisitionCost,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        netProfit: parseFloat((totalRevenue - totalCost).toFixed(2)),
        roiPercent: roi ? parseFloat(roi.toFixed(2)) : null,
      };
    });
  }

  async driverSafetyScores() {
    const drivers = await this.prisma.driver.findMany({
      include: { trips: true },
    });

    return drivers.map((d) => {
      const completedTrips = d.trips.filter((t) => t.status === TripStatus.Completed);
      return {
        driverId: d.id,
        driverName: d.name,
        status: d.status,
        safetyScore: d.safetyScore,
        totalTrips: d.trips.length,
        completedTrips: completedTrips.length,
        licenseExpiry: d.licenseExpiry,
      };
    });
  }

  async fleetSummary() {
    const [vehicles, drivers, trips, fuelLogs, expenses, maintenanceLogs] =
      await Promise.all([
        this.prisma.vehicle.findMany(),
        this.prisma.driver.findMany(),
        this.prisma.trip.findMany(),
        this.prisma.fuelLog.findMany(),
        this.prisma.expense.findMany(),
        this.prisma.maintenanceLog.findMany(),
      ]);

    const completedTrips = trips.filter((t) => t.status === TripStatus.Completed);
    const totalRevenue = completedTrips.reduce((sum, t) => sum + Number(t.revenue), 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);
    const totalOtherExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

    return {
      fleet: {
        totalVehicles: vehicles.length,
        available: vehicles.filter((v) => v.status === 'Available').length,
        onTrip: vehicles.filter((v) => v.status === 'OnTrip').length,
        inShop: vehicles.filter((v) => v.status === 'InShop').length,
        retired: vehicles.filter((v) => v.status === 'Retired').length,
      },
      drivers: {
        total: drivers.length,
        onDuty: drivers.filter((d) => d.status === 'OnDuty').length,
        offDuty: drivers.filter((d) => d.status === 'OffDuty').length,
        suspended: drivers.filter((d) => d.status === 'Suspended').length,
      },
      trips: {
        total: trips.length,
        completed: completedTrips.length,
        dispatched: trips.filter((t) => t.status === 'Dispatched').length,
        draft: trips.filter((t) => t.status === 'Draft').length,
        cancelled: trips.filter((t) => t.status === 'Cancelled').length,
      },
      financials: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        netProfit: parseFloat((totalRevenue - totalCost).toFixed(2)),
        fuelCost: parseFloat(totalFuelCost.toFixed(2)),
        maintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
        otherExpenses: parseFloat(totalOtherExpenses.toFixed(2)),
      },
    };
  }
}
