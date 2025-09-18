import { JwtRefreshStrategy } from '@/modules/auth/passport/jwt-refresh.strategy';
import { JwtStrategy } from '@/modules/auth/passport/jwt.strategy';
import { LocalStrategy } from '@/modules/auth/passport/local.strategy';
import { SessionsModule } from '@/modules/sessions/sessions.module';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports:[UsersModule,SessionsModule,ConfigModule,PassportModule,JwtModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy ],
  exports: [AuthService]
})
export class AuthModule {}
