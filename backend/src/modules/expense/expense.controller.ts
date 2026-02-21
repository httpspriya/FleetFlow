import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../../core/prisma/enums';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.ANALYST)
  findAll() {
    return this.expenseService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.ANALYST)
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Post()
  @Roles(UserRole.MANAGER, UserRole.ANALYST)
  create(@Body() dto: CreateExpenseDto) {
    return this.expenseService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.ANALYST)
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expenseService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
