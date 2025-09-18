import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cookieExtractor } from '@/common/helper/cookie-extractor';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET_REFRESH_TOKEN');
    if (!secret) {
      throw new Error('❌ Missing JWT_SECRET_REFRESH_TOKEN in environment variables');
    }

    super({
      jwtFromRequest: cookieExtractor, // ✅ Lấy từ cookie
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    // Có thể lấy thêm thông tin từ cookie nếu cần
    return { ...payload };
  }
}
