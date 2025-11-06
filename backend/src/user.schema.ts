import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['admin', 'user'] })
  role: 'admin' | 'user';

  @Prop({
    required: true,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  })
  status: 'active' | 'inactive' | 'suspended';

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);