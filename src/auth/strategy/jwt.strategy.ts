import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../services/auth/auth.service';
import { PayloadModel } from '../models/payloadModel';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JWTstrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly _authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
    });
  }
  async validate(payload: PayloadModel) {
    return await this._authService.validateToken(payload);
  }
}
