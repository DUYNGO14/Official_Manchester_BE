import { Module } from '@nestjs/common';
import { CategorySchema } from '@/modules/categories/schemas/category.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from '@/modules/categories/categories.controller';
import { CategoriesService } from '@/modules/categories/categories.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
