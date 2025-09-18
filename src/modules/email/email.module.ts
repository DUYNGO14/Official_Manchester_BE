// src/common/email/email.module.ts
import { MailerModule } from '@nestjs-modules/mailer';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from '@/modules/email/email.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from '@/modules/email/email.processor';
import { UsersModule } from '@/modules/users/users.module';
import { BullBoardService } from '@/bull-board/bull-board.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('SMTP_HOST');
        const port = configService.get<number>('SMTP_PORT');
        const username = configService.get<string>('SMTP_USER');
        const password = configService.get<string>('SMTP_PASSWORD');
        const from = configService.get<string>(
          'EMAIL_ROOT',
          '"No Reply" <no-reply@localhost>',
        );
        const secure = configService.get<boolean>('SMTP_SECURE', false);

        return {
          transport: {
            host,
            port,
            secure : false,
            auth: {
              user: username,
              pass: password,
            },
          },
          defaults: {
            from,
          },
          template: {
            dir: join(process.cwd(), 'src/modules/email/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    ConfigModule,
    BullModule.registerQueue({
      name: 'emailQueue',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
  ],
  providers: [EmailService, EmailProcessor, BullBoardService],
  exports: [EmailService, BullModule, BullBoardService],
})
export class EmailModule implements OnModuleInit {
  private readonly logger = new Logger(EmailModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('SMTP_HOST');
    this.logger.log(`⏳ Initializing email module with host: ${host}`);
  }
}
