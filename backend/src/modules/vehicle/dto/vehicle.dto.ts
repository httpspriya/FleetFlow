import { VehicleStatus } from '../../../core/prisma/enums';
import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  name: string;

  @IsString()
  licensePlate: string;

  @IsInt()
  @Min(1)
  maxCapacity: number;

  @IsInt()
  @Min(0)
  odometer: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  acquisitionCost?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  odometer?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  acquisitionCost?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}

export class UpdateVehicleStatusDto {
  @IsEnum(VehicleStatus)
  status: VehicleStatus;
}
