import {
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
import { VideoValidationPipe } from '@/common/pipes/video-validation.pipe';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadSingleFile(file, {});
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile(ImageValidationPipe) file: Express.Multer.File) {
    return this.uploadService.uploadSingleImage(file, {});
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile(VideoValidationPipe) file: Express.Multer.File) {
    return this.uploadService.uploadVideo(file, {});
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('file[]', 5))
  async uploadMultipleFiles(@UploadedFile() files: Express.Multer.File[]) {
    return this.uploadService.uploadMultipleFiles(files, {});
  }

  @Delete('file/:publicId')
  async deleteFile(@UploadedFile() publicId: string) {
    return this.uploadService.deleteFile(publicId);
  }
}
