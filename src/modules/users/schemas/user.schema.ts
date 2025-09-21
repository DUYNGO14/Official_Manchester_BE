// user.schema.ts
import { AccountType, GenderEnum, UserRole } from '@/common/constants/user.enum';
import { Session } from '@modules/sessions/schemas/session.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';


export interface IAvatar {
  url?: string;
  publicId?: string;
  format?: string;
  resourceType?: string;
  width?: number;
  height?: number;
  bytes?: number;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  fullname?: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  age?: number;

  @Prop({
    type: SchemaTypes.Mixed,
    default: {},
  })
  avatar: IAvatar;

  @Prop( { default: UserRole.USER })
  role: UserRole[];

  @Prop({ default: false })
  isActive: boolean;

  @Prop( { default: AccountType.LOCAL })
  accountType: AccountType;

  @Prop()
  gender?: GenderEnum;

  @Prop()
  password: string;

  @Prop()
  code?: string;

  @Prop()
  expired_code?: Date;

  @Prop({default: '00'})
  number: string;

  // Thêm trường tham chiếu đến các session
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Session' }] })
  sessions: Session[];

  @Prop({type: [{ type: Types.ObjectId, ref: 'Article' }]})
  posts: Types.ObjectId[]
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({email: 1})
UserSchema.index({username: 1})
