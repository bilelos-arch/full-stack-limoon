import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestimonialDocument = Testimonial & Document;

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  childName: string;

  @Prop({ required: true })
  childAge: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  avatarSeed: string;

  @Prop({ type: Object, required: true })
  avatarConfig: {
    hair: string[];
    hairColor: string[];
    skinColor: string[];
    eyes: string[];
    eyebrows: string[];
    mouth: string[];
    earrings?: string[];
    glasses?: string[];
    features?: string[];
    backgroundColor: string[];
  };

  @Prop({ required: true })
  storyTitle: string;

  @Prop({ required: true })
  highlight: string;

  @Prop({ type: String, enum: ['small', 'medium', 'large', 'xlarge'], default: 'medium' })
  size: 'small' | 'medium' | 'large' | 'xlarge';

  @Prop({ default: true })
  isActive: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);