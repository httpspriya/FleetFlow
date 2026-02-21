import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [PrismaModule],
  exports: [PrismaModule, RolesGuard],
  providers: [RolesGuard],
})
export class CoreModule {}
