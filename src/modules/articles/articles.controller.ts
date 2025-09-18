import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  Get,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './schemas/article.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
import {
  ApiResponseSuccess,
  BaseResponse,
  PaginatedData,
} from '@/common/helper/base_response';
import { PaginationQueryDto } from '@/common/dto';
import { ArticleResponseDto } from '@/modules/articles/dto/ArticleResponse.dto';
import { Roles } from '@/common/decorator/roles.decorator';
import { UserRole } from '@/common/constants/user.enum';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // @Post()
  // async create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
  //   return this.articlesService.create(createArticleDto);
  // }

  // @Post('draft')
  // async createDraft(
  //   @Body() createArticleDto: CreateArticleDto,
  // ): Promise<Article> {
  //   return this.articlesService.createDraft(createArticleDto);
  // }

  @Post('publish')
  @UseInterceptors(FileInterceptor('thumbnail'))
  @Roles(UserRole.ADMIN)
  async createAndPublish(
    @Body() createArticleDto: CreateArticleDto,
    @UploadedFile(
      new ParseFilePipe({ fileIsRequired: false }),
      ImageValidationPipe,
    )
    thumbnail?: Express.Multer.File,
  ): Promise<BaseResponse<Article>> {
    const result = await this.articlesService.createAndPublish(
      createArticleDto,
      thumbnail,
    );
    return ApiResponseSuccess('Article created successfully', result, 201);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<BaseResponse<PaginatedData<ArticleResponseDto>>> {
    const result = await this.articlesService.findAll(
      query.page,
      query.limit,
      query.search,
      query.sort,
      query.order,
    );
    return ApiResponseSuccess('Articles fetched successfully', result,200);
  }
}
