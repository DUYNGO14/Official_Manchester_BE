// dto/create-player.dto.ts
import { PlayerType, Position } from '@/common/constants/player.enum';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsDateString,
  Min,
  Max,
  Matches,
  IsDate,
} from 'class-validator';

export class CreatePlayerDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be a valid URL segment (lowercase letters, numbers, and hyphens)',
  })
  slug: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsNotEmpty()
  @IsString()
  position: Position;

  @IsNotEmpty()
  @IsString()
  player_type : PlayerType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(99)
  jerseyNumber?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(120)
  weight?: number;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsDateString()
  joinedDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marketValue?: number;
}