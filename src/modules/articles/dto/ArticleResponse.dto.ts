
type Author = {
  _id: string;
  fullName: string;
  avatarUrl?: string;
} | null;
type Category = {
  _id: string;
  name: string;
  slug: string;
} | null;
export class ArticleResponseDto {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: string;
  author: Author;
  category: Category;
  publishedAt: Date;
  views: number;
}