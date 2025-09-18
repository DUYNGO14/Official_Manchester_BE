
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';
import { FileResponseDto, MultipleFilesResponseDto } from '@/modules/upload/dto/file-response.dto';
import { UploadFileDto } from '@/modules/upload/dto/upload-file.dto';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadSingleFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto> {
    try {
      const result = await this.cloudinaryService.uploadFile(
        file,
        uploadFileDto.folder,
      );
      return this.mapToFileResponseDto(result);
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    uploadFileDto: UploadFileDto,
  ): Promise<MultipleFilesResponseDto> {
    try {
      const results = await this.cloudinaryService.uploadMultipleFiles(
        files,
        uploadFileDto.folder,
      );

      return {
        files: results.map((result) => this.mapToFileResponseDto(result)),
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload files: ${error.message}`);
    }
  }

  async uploadSingleImage(
    image: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto> {
    try {
      // Additional image-specific validation
      if (!image.mimetype.startsWith('image/')) {
        throw new BadRequestException('File must be an image');
      }

      const result = await this.cloudinaryService.uploadImage(image, uploadFileDto.folder);
      return this.mapToFileResponseDto(result);
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<any> {
    return this.cloudinaryService.deleteFile(publicId);
  }

  async uploadVideo(
    video: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto> {
    try {
      if (!video.mimetype.startsWith('video/')) {
        throw new BadRequestException('File must be a video');
      }

      const result = await this.cloudinaryService.uploadVideo(video, uploadFileDto.folder);
      return this.mapToFileResponseDto(result);
    } catch (error) {
      throw new BadRequestException(`Failed to upload video: ${error.message}`);
    }
  }

  private mapToFileResponseDto(result: any): FileResponseDto {
    return {
      url: result.url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      duration: result.duration,
      resourceType: result.resource_type,
    };
  }
}
