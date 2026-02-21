import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../../core/prisma/enums';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('fuel-efficiency')
  @Roles(UserRole.MANAGER, UserRole.ANALYST, UserRole.SAFETY_OFFICER)
  fuelEfficiency() {
    return this.analyticsService.fuelEfficiencyPerVehicle();
  }

  @Get('roi')
  @Roles(UserRole.MANAGER, UserRole.ANALYST)
  roi() {
    return this.analyticsService.roiPerVehicle();
  }

  @Get('driver-safety')
  @Roles(UserRole.MANAGER, UserRole.ANALYST, UserRole.SAFETY_OFFICER)
  driverSafety() {
    return this.analyticsService.driverSafetyScores();
  }

  @Get('fleet-summary')
  @Roles(UserRole.MANAGER, UserRole.ANALYST, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER)
  fleetSummary() {
    return this.analyticsService.fleetSummary();
  }
}
