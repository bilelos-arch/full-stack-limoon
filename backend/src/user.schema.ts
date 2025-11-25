import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: Date })
  birthDate?: Date;

  @Prop()
  country?: string;

  @Prop()
  city?: string;

  @Prop({
    type: {
      language: { type: String, default: 'fr' },
      theme: { type: String, default: 'light' },
      notifications: { type: Boolean, default: true }
    },
    default: {}
  })
  settings: {
    language: string;
    theme: string;
    notifications: boolean;
  };

  @Prop({
    type: [{
      id: String,
      title: String,
      createdAt: Date,
      category: String,
      language: String,
      link: String
    }],
    default: []
  })
  storyHistory: {
    id: string;
    title: string;
    createdAt: Date;
    category: string;
    language: string;
    link: string;
  }[];

  @Prop({
    type: [{
      id: String,
      productName: String,
      price: Number,
      date: Date,
      paymentMethod: String,
      status: String,
      invoiceUrl: String
    }],
    default: []
  })
  purchaseHistory: {
    id: string;
    productName: string;
    price: number;
    date: Date;
    paymentMethod: string;
    status: string;
    invoiceUrl: string;
  }[];

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: 'admin' | 'user';

  @Prop({
    required: true,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  })
  status: 'active' | 'inactive' | 'suspended';

  @Prop({
    type: {
      name: String,
      age: String,
      gender: String,
      mood: String,
      hairType: String,
      hairColor: String,
      skinTone: String,
      eyes: String,
      eyebrows: String,
      mouth: String,
      glasses: String,
      glassesStyle: String,
      accessories: String,
      earrings: String,
      features: String,
      base: String,
      hair: String,
      skinColor: String,
    }
  })
  child?: {
    name: string;
    age: string;
    gender: string;
    mood: string;
    hairType: string;
    hairColor: string;
    skinTone: string;
    eyes: string;
    eyebrows: string;
    mouth: string;
    glasses: string;
    glassesStyle: string;
    accessories: string;
    earrings: string;
    features: string;
    base: string;
    hair: string;
    skinColor: string;
  };

  @Prop()
  childAvatar?: string;

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);