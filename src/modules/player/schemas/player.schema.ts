import { Position } from '@/common/constants/player.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  nationality: string;

  @Prop({
    type: String,
    enum: Object.values(Position),
    required: true,
  })
  position: Position;

  @Prop()
  jerseyNumber: number;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop()
  biography: string;

  @Prop()
  image: string;

  @Prop()
  joinedDate: Date;

  @Prop()
  marketValue: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
