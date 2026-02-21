import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  refresh(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.refresh(user.sub, user.email, user.role);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    // Stateless JWT — client discards tokens
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.me(user.id);
  }
}
