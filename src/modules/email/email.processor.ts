// email/email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';

@Processor('emailQueue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    try {
      switch (job.name) {
        case 'sendOtp':
          await this.sendOtpEmail(job.data);
          break;
        // Có thể thêm các case khác cho các loại email khác
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      throw error; // BullMQ sẽ tự động retry nếu có cấu hình
    }
  }

  private async sendOtpEmail(data: { email: string; otp: string; time: number }): Promise<void> {
    const { email, otp, time } = data;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Mã xác thực OTP',
        template: 'verify',
        context: {
          otp,
          time
        },
      });
      
      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      throw error; // Để BullMQ retry job
    }
  }
}