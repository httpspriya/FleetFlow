import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { DriverModule } from './modules/driver/driver.module';
import { TripModule } from './modules/trip/trip.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ExpenseModule } from './modules/expense/expense.module';

@Module({
  imports: [CoreModule, AuthModule, VehicleModule, DriverModule, TripModule, AnalyticsModule, MaintenanceModule, ExpenseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
