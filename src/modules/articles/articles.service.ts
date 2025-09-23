import { ArticleResponseDto } from './dto/ArticleResponse.dto';
import { UsersService } from './../users/users.service';
import { CategoriesService } from './../categories/categories.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UploadService } from '@/modules/upload/upload.service';
import { PaginatedData } from '@/common/helper/base_response';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private uploadService: UploadService,
  ) {}

  // Tạo slug từ title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Loại bỏ ký tự không hợp lệ
      .replace(/\s+/g, '-') // Thay space bằng dấu gạch ngang
      .replace(/-+/g, '-') // Thay nhiều dấu gạch ngang bằng một dấu
      .replace(/^-+/, '') // Loại bỏ dấu gạch ngang ở đầu
      .replace(/-+$/, ''); // Loại bỏ dấu gạch ngang ở cuối
  }

  // Kiểm tra slug đã tồn tại chưa
  private async isSlugUnique(slug: string): Promise<boolean> {
    const existingArticle = await this.articleModel.findOne({ slug }).exec();
    return !existingArticle;
  }

  // Tạo slug duy nhất
  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = this.generateSlug(title);
    let isUnique = false;
    let counter = 1;
    const originalSlug = slug;

    while (!isUnique) {
      isUnique = await this.isSlugUnique(slug);
      if (!isUnique) {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    return slug;
  }

  // Tạo bài viết mới
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    // Kiểm tra category tồn tại
    const category = await this.categoriesService.findOne(
      createArticleDto.categoryId.toString(),
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Kiểm tra author tồn tại
    const author = await this.usersService.findOne(
      createArticleDto.authorId.toString(),
    );
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Tạo slug nếu không được cung cấp
    let slug = createArticleDto.slug;
    if (!slug) {
      slug = await this.generateUniqueSlug(createArticleDto.title);
    } else {
      // Kiểm tra slug cung cấp có unique không
      const isUnique = await this.isSlugUnique(slug);
      if (!isUnique) {
        throw new Error('Slug already exists');
      }
    }

    // Thiết lập publishedAt nếu status là published
    let publishedAt = createArticleDto.publishedAt;
    if (createArticleDto.status === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    // Tạo bài viết mới
    const createdArticle = new this.articleModel({
      ...createArticleDto,
      slug,
      publishedAt,
      views: 0,
    });

    return createdArticle.save();
  }

  // Tạo bài viết với status draft
  async createDraft(createArticleDto: CreateArticleDto): Promise<Article> {
    return this.create({
      ...createArticleDto,
      status: 'draft',
    });
  }

  // Tạo và publish bài viết ngay lập tức
  async createAndPublish(
    createArticleDto: CreateArticleDto,
    thumbnail?: Express.Multer.File,
  ): Promise<Article> {
    try {
      if (thumbnail) {
        const upload = await this.uploadService.uploadSingleImage(thumbnail, {
          folder: 'articles',
        });
        createArticleDto.thumbnail = upload.url;
      }
      const data = {
        ...createArticleDto,
        categoryId: new Types.ObjectId(createArticleDto.categoryId),
        authorId: new Types.ObjectId(createArticleDto.authorId),
        status: 'published',
      };
      return this.create(data);
    } catch (error) {
      throw error;
    }
  }

  async getFiveLatestArticles(count = 5): Promise<Article[]> {
    try {
      const articles = await this.articleModel
        .find()
        .sort({ createdAt: -1 })
        .limit(count)
        .populate('authorId', 'username avatar')
        .populate('categoryId', 'name slug')
        .exec();
      return articles;
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
    sort: 'asc' | 'desc' = 'asc',
    order = 'createdAt',
  ): Promise<PaginatedData<ArticleResponseDto>> {
    try {
      const skip = (page - 1) * limit;

      // Query tìm kiếm
      const query: Record<string, any> = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Sort
      const sortOption: Record<string, 1 | -1> = {
        [order]: sort === 'asc' ? 1 : -1,
      };

      // Lấy dữ liệu & tổng số song song
      const [articles, total] = await Promise.all([
        this.articleModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .sort(sortOption)
          .populate('authorId', 'username avatar')
          .populate('categoryId', 'name slug')
          .exec(),
        this.articleModel.countDocuments(query).exec(),
      ]);

      const totalPage = Math.ceil(total / limit);

      return {
        data: articles.map((article) => this.mapToResponseDto(article)),
        page,
        limit,
        total,
        totalPage,
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy bài viết theo slug
  async findOneBySlug(slug: string): Promise<Article> {
    try {
      const article = await this.articleModel
        .findOne({ slug })
        .populate('authorId', 'username avatar')
        .populate('categoryId', 'name slug')
        .exec();
      if (!article) {
        throw new NotFoundException(`Article with slug ${slug} not found`);
      }
      return article;
    } catch (error) {
      throw error;
    }
  }
  // lấy bài vieeys theo id
  async findOneById(id: string): Promise<Article> {
    try {
      const article = await this.articleModel.findById(id)
      .populate('authorId', 'username avatar')
      .populate('categoryId', 'name slug')
      .exec();
      if (!article) {
        throw new NotFoundException(`Article with id ${id} not found`);
      }
      return article;
    } catch (error) {
      throw error;
    }
  }

  private mapToResponseDto(article: any): ArticleResponseDto {
    return {
      _id: article._id.toString(),
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      content: article.content,
      thumbnail: article.thumbnail,
      author: article.authorId
        ? {
            _id: article.authorId._id.toString(),
            fullName: article.authorId.username,
            avatarUrl: article.authorId.avatarUrl,
          }
        : null,
      category: article.categoryId
        ? {
            _id: article.categoryId._id.toString(),
            name: article.categoryId.name,
            slug: article.categoryId.slug,
          }
        : null,
      publishedAt: article.publishedAt,
      views: article.views,
    };
  }
}
