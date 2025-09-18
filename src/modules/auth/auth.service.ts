import {
  ApiResponseSuccess,
  BaseResponse,
} from '@/common/helper/base_response';
import { getDeviceInfo, stringifyDevice } from '@/common/helper/info_device';
import { comparePassword } from '@/common/helper/password.util';
import { User } from '@/modules/users/schemas/user.schema';
import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/create-auth.dto';
import ms from 'ms';
import { SessionsService } from '@/modules/sessions/sessions.service';
import mongoose from 'mongoose';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getTokens(payload: any) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_ACCESS_TOKEN'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_REFRESH_TOKEN'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED'),
    });
    const ttl = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED');
    const expired_refresh_token = new Date(Date.now() + ms(ttl));

    return {
      accessToken,
      refreshToken,
      expired_refresh_token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isMatch = await comparePassword(password, user.password);
    if (user && isMatch) {
      return user;
    }
    return null;
  }

  async login(
    user: any,
    res: any,
    userAgent: string,
  ): Promise<BaseResponse<any>> {
    try {
      const deviceInfo = getDeviceInfo(userAgent);
      const deviceString = stringifyDevice(deviceInfo);
      const payload = {
        sub: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        device: deviceString,
      };
      const { accessToken, refreshToken, expired_refresh_token } =
        await this.getTokens(payload);

      const sessionId = await this.sessionService.create(
        user._id,
        refreshToken,
        deviceString,
        expired_refresh_token,
      );
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED')),
      });
      return ApiResponseSuccess(
        'Login successfully',
        {
          accessToken,
          user: { _id: user._id, email: user.email, username: user.username, role: user.role },
        },
        200,
      );
    } catch (error) {
      throw error;
    }
  }

  async register(
    register: RegisterUserDto,
  ): Promise<BaseResponse<Omit<User, 'password'>>> {
    const result = await this.usersService.registerUser(register);
    return result;
  }

  async verifyAccount(
    email: string,
    code: string,
  ): Promise<BaseResponse<Omit<User, 'password'>>> {
    const result = await this.usersService.verifyAccount(email, code);
    return result;
  }

  async logout(user: any) : Promise<BaseResponse<any>> {
    try {
      await this.sessionService.revoke(user.sub, user.device);
      return ApiResponseSuccess('Logout successfully', null, 200);
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(
    user: any,
    refreshTokenOld: string,
    res
  ) {
    try {
      if(!refreshTokenOld) throw new  UnauthorizedException('Refresh token not found');
      const isValidToken = await this.sessionService.validate(user.sub, refreshTokenOld, user.device);
      if(!isValidToken) throw new UnauthorizedException('Invalid refresh token');

      const payload = {
        sub: user.sub,
        email: user.email,
        username: user.username,
        role: user.role,
        device: user.device,
      }
      const { accessToken, refreshToken, expired_refresh_token } =
          await this.getTokens(payload);

      const sessionId = await this.sessionService.update(
        user.sub,
        refreshToken,
        expired_refresh_token,
        user.device,
      )

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRED')),
      });
      return ApiResponseSuccess(
        'Refresh token successfully',
        {
          accessToken,
          user: { _id: user.sub, email: user.email, username: user.username, role: user.role },
        },
        200,
      );
    } catch (error) {
      throw error;
    }
  }
}
