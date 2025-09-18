import { BullBoardService } from '@/bull-board/bull-board.service';
import { AllExceptionsFilter } from '@/common/filters/all-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { Express } from 'express';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lấy instance của BullBoardService
  const bullBoardService = app.get(BullBoardService);
  const serverAdapter = bullBoardService.getServerAdapter();

  // Áp dụng middleware BullBoard vào Express instance
  const expressApp: Express = app.getHttpAdapter().getInstance();
  expressApp.use('/queues', serverAdapter.getRouter());

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  //  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    }
  ));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
