import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { VehicleStatus } from '../../core/prisma/enums';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: true,
        maintenanceLogs: true,
        fuelLogs: true,
        expenses: true,
      },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);
    return vehicle;
  }

  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        ...dto,
        acquisitionCost: dto.acquisitionCost ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOne(id);
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: VehicleStatus) {
    await this.findOne(id);
    return this.prisma.vehicle.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
