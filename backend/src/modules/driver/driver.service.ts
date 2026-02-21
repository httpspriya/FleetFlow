import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';
import { DriverStatus } from '../../core/prisma/enums';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.driver.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { trips: true },
    });
    if (!driver) throw new NotFoundException(`Driver ${id} not found`);
    return driver;
  }

  async create(dto: CreateDriverDto) {
    return this.prisma.driver.create({ data: dto });
  }

  async update(id: string, dto: UpdateDriverDto) {
    await this.findOne(id);
    return this.prisma.driver.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: DriverStatus) {
    await this.findOne(id);
    return this.prisma.driver.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.driver.delete({ where: { id } });
  }
}
