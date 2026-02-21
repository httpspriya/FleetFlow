import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateTripDto, UpdateTripDto, UpdateTripStatusDto } from './dto/trip.dto';
import { TripStatus, VehicleStatus, DriverStatus } from '../../core/prisma/enums';

const VALID_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  Draft: [TripStatus.Dispatched, TripStatus.Cancelled],
  Dispatched: [TripStatus.Completed, TripStatus.Cancelled],
  Completed: [],
  Cancelled: [],
};

@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true, driver: true },
    });
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    return trip;
  }

  async create(dto: CreateTripDto) {
    // Ensure vehicle exists and is available
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    if (vehicle.status !== VehicleStatus.Available) {
      throw new BadRequestException(`Vehicle is not available (status: ${vehicle.status})`);
    }

    // Ensure driver exists and is on duty
    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
    });
    if (!driver) throw new NotFoundException(`Driver ${dto.driverId} not found`);
    if (driver.status !== DriverStatus.OnDuty) {
      throw new BadRequestException(`Driver is not on duty (status: ${driver.status})`);
    }

    return this.prisma.trip.create({ data: dto });
  }

  async update(id: string, dto: UpdateTripDto) {
    const trip = await this.findOne(id);
    if (trip.status === TripStatus.Completed || trip.status === TripStatus.Cancelled) {
      throw new BadRequestException(`Cannot update a ${trip.status} trip`);
    }
    return this.prisma.trip.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, dto: UpdateTripStatusDto) {
    const trip = await this.findOne(id);
    const allowed = VALID_TRANSITIONS[trip.status];

    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${trip.status} to ${dto.status}`,
      );
    }

    // Completing a trip requires endOdo
    if (dto.status === TripStatus.Completed) {
      const endOdo = dto.endOdo ?? trip.endOdo;
      if (!endOdo) {
        throw new BadRequestException('endOdo is required to complete a trip');
      }
      if (endOdo <= trip.startOdo) {
        throw new BadRequestException('endOdo must be greater than startOdo');
      }

      // Update vehicle odometer and set status back to Available
      await this.prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          odometer: endOdo,
          status: VehicleStatus.Available,
        },
      });

      return this.prisma.trip.update({
        where: { id },
        data: { status: dto.status, endOdo },
      });
    }

    // Dispatching a trip locks the vehicle
    if (dto.status === TripStatus.Dispatched) {
      await this.prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.OnTrip },
      });
    }

    // Cancelling a trip frees the vehicle
    if (dto.status === TripStatus.Cancelled) {
      await this.prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.Available },
      });
    }

    return this.prisma.trip.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(id: string) {
    const trip = await this.findOne(id);
    if (trip.status === TripStatus.Dispatched) {
      throw new BadRequestException('Cannot delete a dispatched trip');
    }
    return this.prisma.trip.delete({ where: { id } });
  }
}
