// session.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';


export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, unique: true })
  refreshToken: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  device: string;

  @Prop({ default: false })
  revoked: boolean; 

  // Tham chiếu đến User
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const SessionSchema = SchemaFactory.createForClass(Session);