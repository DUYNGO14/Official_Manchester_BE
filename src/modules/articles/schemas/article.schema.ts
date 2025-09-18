import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  summary: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  thumbnail: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ enum: ['draft', 'published', 'archived'], default: 'published' })
  status: string;

  @Prop()
  publishedAt: Date;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);