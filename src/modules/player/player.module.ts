import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSchema } from '@/modules/player/schemas/player.schema';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Player', schema: PlayerSchema }]),UploadModule],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
