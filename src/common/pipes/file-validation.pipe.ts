// src/common/pipes/file-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ];

  private readonly allowedExtensions = [
    // Images
    'jpeg',
    'jpg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg',
    // Videos
    'mp4',
    'mpeg',
    'mov',
    'avi',
    'webm',
    // Documents
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'zip',
    'rar',
  ];

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.originalname || !file.mimetype || file.size === undefined) {
      throw new BadRequestException('Invalid file format');
    }

    console.log('Validating file:', {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    });

    // Validate size
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File size too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`,
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${this.getHumanReadableTypes()}`,
      );
    }

    // Validate extension
    const fileExtension = (
      file.originalname?.split('.').pop() as string
    )?.toLowerCase();
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file extension: .${fileExtension}. Allowed: ${this.allowedExtensions.map((ext) => `.${ext}`).join(', ')}`,
      );
    }

    return file;
  }

  private getHumanReadableTypes(): string {
    const categories = {
      'image/': 'Images (JPEG, PNG, GIF, BMP, WEBP, SVG)',
      'video/': 'Videos (MP4, MPEG, MOV, AVI, WEBM)',
      'application/pdf': 'PDF Documents',
      'application/msword': 'Word Documents (DOC)',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'Word Documents (DOCX)',
      'application/vnd.ms-excel': 'Excel Files (XLS)',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'Excel Files (XLSX)',
      'text/plain': 'Text Files (TXT)',
      'application/zip': 'ZIP Archives',
      'application/x-rar-compressed': 'RAR Archives',
    };

    return Object.values(categories).join(', ');
  }
}
