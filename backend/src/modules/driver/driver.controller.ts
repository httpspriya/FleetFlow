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
import { DriverService } from './driver.service';
import { CreateDriverDto, UpdateDriverDto, UpdateDriverStatusDto } from './dto/driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../../core/prisma/enums';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.ANALYST)
  findAll() {
    return this.driverService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.ANALYST)
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(id);
  }

  @Post()
  @Roles(UserRole.MANAGER, UserRole.SAFETY_OFFICER)
  create(@Body() dto: CreateDriverDto) {
    return this.driverService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.SAFETY_OFFICER)
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.driverService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.MANAGER, UserRole.SAFETY_OFFICER)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDriverStatusDto) {
    return this.driverService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.SAFETY_OFFICER)
  remove(@Param('id') id: string) {
    return this.driverService.remove(id);
  }
}
