import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.expense.findMany({
      orderBy: { id: 'desc' },
      include: { vehicle: true },
    });
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);
    return expense;
  }

  async create(dto: CreateExpenseDto) {
    await this.prisma.vehicle.findUniqueOrThrow({ where: { id: dto.vehicleId } });
    return this.prisma.expense.create({
      data: dto,
      include: { vehicle: true },
    });
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);
    return this.prisma.expense.update({
      where: { id },
      data: dto,
      include: { vehicle: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.expense.delete({ where: { id } });
  }
}
