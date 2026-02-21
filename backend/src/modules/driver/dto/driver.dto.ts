import { DriverStatus } from '../../../core/prisma/enums';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateDriverDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsDateString()
  licenseExpiry: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  safetyScore?: number;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  safetyScore?: number;
}

export class UpdateDriverStatusDto {
  @IsEnum(DriverStatus)
  status: DriverStatus;
}
