import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module';

@Module({
  imports :[CloudinaryModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports:[UploadService]
})
export class UploadModule {}