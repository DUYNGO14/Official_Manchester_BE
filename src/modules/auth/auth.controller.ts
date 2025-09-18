import { RegisterUserDto } from '@/modules/auth/dto/create-auth.dto';
import { LocalAuthGuard } from '@/modules/auth/passport/local-auth.guard';
import {
  Body,
  Controller,
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
    return result;
  }

  @Public()
  @Post('/register')
  async register(@Body() registerDto: RegisterUserDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('/verify-account')
  async verifyAccount(@Body() { email, code }) {
    return await this.authService.verifyAccount(email, code);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.logout(req.user);
    response.clearCookie('refreshToken');
    return result;
  }
  
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('/refresh-token')
  async refreshToken(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = req.user;
    const refreshTokenOld = req.cookies.refreshToken;
    return await this.authService.refreshToken(user, refreshTokenOld, response);
  }
}
