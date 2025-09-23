import { Expose } from 'class-transformer';
import { PickType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from '@/modules/player/dto/create-player.dto';
import { PlayerType, Position } from '@/common/constants/player.enum';

export class PlayerResponse{
  @Expose()
  fullName: string;

  @Expose()
  slug: string;

  @Expose()
  image: string;

  @Expose()
  position: Position;

  @Expose()
  player_type: PlayerType;

  @Expose()
  jerseyNumber: number;
}
