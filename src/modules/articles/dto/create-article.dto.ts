import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsMongoId()
  @IsNotEmpty()
  authorId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: Types.ObjectId;

  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;

  @Type(() => Date)
  @IsOptional()
  publishedAt?: Date;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}