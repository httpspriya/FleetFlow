import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type StrategyOptionsWithRequest } from 'passport-jwt';
import type { Request } from 'express';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET environment variable is required');
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    return { ...payload, refreshToken };
  }
}
