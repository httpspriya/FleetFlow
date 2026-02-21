import { IsString, IsNumber, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  vehicleId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class UpdateExpenseDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
