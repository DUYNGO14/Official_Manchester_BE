// dto/create-category.dto.ts
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be a valid URL segment (lowercase letters, numbers, and hyphens)'
  })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;
}