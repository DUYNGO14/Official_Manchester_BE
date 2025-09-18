// src/common/pipes/image-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private readonly maxSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
  ];

  private readonly allowedExtensions = [
    'jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp', 'svg'
  ];

  transform(file: Express.Multer.File) {
    if (!file) {
     return file;
    }

    // Kiểm tra cấu trúc file object
    if (!file.originalname || !file.mimetype || file.size === undefined) {
      throw new BadRequestException('Invalid image file format');
    }

    console.log('Validating image:', {
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    });

    // Validate size
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `Image size too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 5MB`
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image type: ${file.mimetype}. Allowed: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    // Validate extension
    const fileExtension = (file.originalname?.split('.').pop() as string)?.toLowerCase();
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid image extension: .${fileExtension}. Allowed: ${this.allowedExtensions.map(ext => `.${ext}`).join(', ')}`
      );
    }

    return file;
  }
}