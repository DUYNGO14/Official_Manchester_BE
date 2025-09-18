// src/common/pipes/video-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class VideoValidationPipe implements PipeTransform {
  private readonly maxSize = 50 * 1024 * 1024; // 50MB
  private readonly maxDuration = 300; // 5 minutes in seconds
  private readonly allowedMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/3gpp',
    'video/3gpp2',
  ];

  private readonly allowedExtensions = [
    'mp4', 'mpeg', 'mov', 'avi', 'webm', '3gp', '3g2'
  ];

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    if (!file.originalname || !file.mimetype || file.size === undefined) {
      throw new BadRequestException('Invalid video file format');
    }

    console.log('Validating video:', {
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    });

    // Validate size
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `Video size too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 50MB`
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid video type: ${file.mimetype}. Allowed: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    // Validate extension
    const fileExtension = (file.originalname?.split('.').pop() as string)?.toLowerCase();
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid video extension: .${fileExtension}. Allowed: ${this.allowedExtensions.map(ext => `.${ext}`).join(', ')}`
      );
    }

    return file;
  }
}