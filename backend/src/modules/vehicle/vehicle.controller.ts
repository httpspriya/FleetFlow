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
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto, UpdateVehicleStatusDto } from './dto/vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../../core/prisma/enums';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.ANALYST)
  findAll() {
    return this.vehicleService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.ANALYST)
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Post()
  @Roles(UserRole.MANAGER)
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicleService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.MANAGER)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateVehicleStatusDto) {
    return this.vehicleService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }
}
