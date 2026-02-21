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
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceLogDto, UpdateMaintenanceLogDto } from './dto/maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../../core/prisma/enums';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.ANALYST)
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.ANALYST)
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @Roles(UserRole.MANAGER, UserRole.SAFETY_OFFICER)
  create(@Body() dto: CreateMaintenanceLogDto) {
    return this.maintenanceService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.SAFETY_OFFICER)
  update(@Param('id') id: string, @Body() dto: UpdateMaintenanceLogDto) {
    return this.maintenanceService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}
