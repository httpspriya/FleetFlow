import { TripStatus } from '../../../core/prisma/enums';
import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  vehicleId: string;

  @IsString()
  driverId: string;

  @IsInt()
  @Min(1)
  cargoWeight: number;

  @IsNumber()
  @Min(0)
  revenue: number;

  @IsInt()
  @Min(0)
  startOdo: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  endOdo?: number;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  distance?: number;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}

export class UpdateTripDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  cargoWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  revenue?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  endOdo?: number;
}

export class UpdateTripStatusDto {
  @IsEnum(TripStatus)
  status: TripStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  endOdo?: number;
}
