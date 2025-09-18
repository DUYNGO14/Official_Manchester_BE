import { ConfigService } from '@nestjs/config';
// src/common/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(
    @InjectQueue('emailQueue') private readonly emailQueue: Queue,
    private readonly configService: ConfigService,
  ) {}
  async sendOtpEmail(data: { email: string; otp: string }) {
    if (!this.isValidEmail(data.email)) {
      this.logger.warn(`Invalid email address: ${data.email}`);
      throw new Error('Invalid email');
    }
    try {
      const time = this.configService.get<number>('TIME_OUT_OTP');

      //add job to queue
      await this.emailQueue.add(
        'sendOtp',
        { ...data, time },
      );
      this.logger.log(`Queued OTP email job for ${data.email}`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${data.email}:`, error);
      throw error;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
