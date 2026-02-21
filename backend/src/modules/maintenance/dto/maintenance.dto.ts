import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateMaintenanceLogDto {
  @IsString()
  vehicleId: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsOptional()
  @IsString()
  issue?: string;

  @IsOptional()
  @IsDateString()
  serviceDate?: string;
}

export class UpdateMaintenanceLogDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  issue?: string;

  @IsOptional()
  @IsDateString()
  serviceDate?: string;
}
