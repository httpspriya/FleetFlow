import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateMaintenanceLogDto, UpdateMaintenanceLogDto } from './dto/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.maintenanceLog.findMany({
      orderBy: { id: 'desc' },
      include: { vehicle: true },
    });
  }

  async findOne(id: string) {
    const log = await this.prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!log) throw new NotFoundException(`Maintenance log ${id} not found`);
    return log;
  }

  async create(dto: CreateMaintenanceLogDto) {
    await this.prisma.vehicle.findUniqueOrThrow({ where: { id: dto.vehicleId } });
    return this.prisma.maintenanceLog.create({
      data: {
        vehicleId: dto.vehicleId,
        cost: dto.cost,
        issue: dto.issue,
        serviceDate: dto.serviceDate ? new Date(dto.serviceDate) : undefined,
      },
      include: { vehicle: true },
    });
  }

  async update(id: string, dto: UpdateMaintenanceLogDto) {
    await this.findOne(id);
    return this.prisma.maintenanceLog.update({
      where: { id },
      data: {
        ...(dto.cost != null && { cost: dto.cost }),
        ...(dto.issue !== undefined && { issue: dto.issue }),
        ...(dto.serviceDate !== undefined && {
          serviceDate: dto.serviceDate ? new Date(dto.serviceDate) : null,
        }),
      },
      include: { vehicle: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.maintenanceLog.delete({ where: { id } });
  }
}
