import { RegisterUserDto } from '@/modules/auth/dto/create-auth.dto';
import { LocalAuthGuard } from '@/modules/auth/passport/local-auth.guard';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { Public } from '@/common/decorator/public.decorator';
import { JwtRefreshGuard } from '@/modules/auth/passport/jwt-refresh.guard';
import { JwtAuthGuard } from '@/modules/auth/passport/jwt.guard';
import { ApiResponseSuccess } from '@/common/helper/base_response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.login(req.user, response, userAgent);
    return ApiResponseSuccess('Login successfully', result, 200);
  }

  @Public()
  @Post('/register')
  async register(@Body() registerDto: RegisterUserDto) {
    const result = await this.authService.register(registerDto);
    return ApiResponseSuccess('Register successfully', result, 200);
  }

  @Public()
  @Post('/verify-account')
  async verifyAccount(@Body() { email, code }) {
    return await this.authService.verifyAccount(email, code);
  }

  // @Public()
  // @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.logout(req.user);
    return ApiResponseSuccess('Logout successfully', result, 200);
  }
  
  @Public()
  @Post('/refresh-token')
  async refreshToken(
    @Request() req,
  ) {
    const refreshTokenOld = req.cookies['refresh_cookei'] || '';
    const result = await this.authService.refreshToken(refreshTokenOld);
    return ApiResponseSuccess('Refresh token successfully', result, 200);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const result =  await this.authService.getProfile(req.user.userId);
    return result;
  }
}
