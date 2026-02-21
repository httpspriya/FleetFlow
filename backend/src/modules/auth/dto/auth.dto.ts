import { UserRole } from '../../../core/prisma/enums';
import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
