import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemplateDocument = Template & Document;

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: ['Contes et aventures imaginaires', 'Héros du quotidien', 'Histoires avec des animaux', 'Histoires éducatives', 'Valeurs et développement personnel', 'Vie quotidienne et école', 'Fêtes et occasions spéciales', 'Exploration et science-fiction', 'Culture et traditions', 'Histoires du soir'], required: true })
  category: 'Contes et aventures imaginaires' | 'Héros du quotidien' | 'Histoires avec des animaux' | 'Histoires éducatives' | 'Valeurs et développement personnel' | 'Vie quotidienne et école' | 'Fêtes et occasions spéciales' | 'Exploration et science-fiction' | 'Culture et traditions' | 'Histoires du soir';

  @Prop({ type: String, enum: ['boy', 'girl', 'unisex'], required: true })
  gender: 'boy' | 'girl' | 'unisex';

  @Prop({ type: String, enum: ['3 ans - 5 ans', '6 ans - 8 ans', '9 ans - 11 ans', '12 ans - 15 ans'], required: true })
  ageRange: '3 ans - 5 ans' | '6 ans - 8 ans' | '9 ans - 11 ans' | '12 ans - 15 ans';

  @Prop({ type: String, enum: ['Français', 'Anglais', 'Arabe'], required: true })
  language: 'Français' | 'Anglais' | 'Arabe';

  @Prop({ required: true })
  pdfPath: string;

  @Prop({ required: true })
  coverPath: string;

  @Prop()
  pageCount?: number;

  @Prop({ type: Object })
  dimensions?: { width: number; height: number };

  @Prop({ type: [String], default: [] })
  variables: string[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false })
  isFeatured: boolean;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);