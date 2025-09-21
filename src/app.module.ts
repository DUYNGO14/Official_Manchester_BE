import { JwtAuthGuard } from '@/modules/auth/passport/jwt.guard';
import { RolesGuard } from '@/modules/auth/passport/roles.guard';
import { EmailModule } from '@/modules/email/email.module';
import { PlayerModule } from '@/modules/player/player.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/common/redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TagsModule } from './modules/tags/tags.module';
import { UsersModule } from './modules/users/users.module';
import { UploadModule } from './modules/upload/upload.module';
import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module';
import { BullBoardService } from './modules/bull-board/bull-board.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { ArticlesModule } from '@/modules/articles/articles.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
     // Cấu hình BullBoard
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    DatabaseModule,
    EmailModule,
    RedisModule,
    UsersModule,
    SessionsModule,
    AuthModule,
    CategoriesModule,
    PlayerModule,
    TagsModule,
    CloudinaryModule,
    UploadModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
    // {
    //   provide: 'APP_GUARD',
    //   useClass: JwtRefreshGuard,
    // },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
    BullBoardService,
  ],
})
export class AppModule {}
