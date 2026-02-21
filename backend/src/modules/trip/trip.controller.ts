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
import { TripService } from './trip.service';
import { CreateTripDto, UpdateTripDto, UpdateTripStatusDto } from './dto/trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../../core/prisma/enums';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.ANALYST)
  findAll() {
    return this.tripService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER, UserRole.ANALYST)
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  @Post()
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER)
  create(@Body() dto: CreateTripDto) {
    return this.tripService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER)
  update(@Param('id') id: string, @Body() dto: UpdateTripDto) {
    return this.tripService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.MANAGER, UserRole.DISPATCHER)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTripStatusDto) {
    return this.tripService.updateStatus(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.tripService.remove(id);
  }
}
