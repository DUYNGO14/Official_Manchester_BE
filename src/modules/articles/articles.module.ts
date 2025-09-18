import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleSchema } from '@/modules/articles/schemas/article.schema';
import { UsersModule } from '@/modules/users/users.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),UploadModule, UsersModule, CategoriesModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
