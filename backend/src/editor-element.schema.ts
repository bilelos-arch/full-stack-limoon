interface FontStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

//backend/src/editor-element.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class EditorElement extends Document {
  // MongoDB _id will be used automatically (no need to define id field)

  @Prop({ type: Types.ObjectId, ref: 'Template' })
  templateId: Types.ObjectId;

  @Prop({ type: String, enum: ['text', 'image'] })
  type: 'text' | 'image';

  @Prop()
  pageIndex: number;

  @Prop()
  x: number; // Position X en pourcentage relatif (0-100) de la largeur de la page

  @Prop()
  y: number; // Position Y en pourcentage relatif (0-100) de la hauteur de la page

  @Prop()
  width: number; // Largeur en pourcentage relatif (0-100) de la largeur de la page

  @Prop()
  height: number; // Hauteur en pourcentage relatif (0-100) de la hauteur de la page

  @Prop({ required: false })
  textContent?: string;

  @Prop({ required: false })
  font?: string;

  @Prop({ required: false })
  fontSize?: number;

  @Prop({ required: false, type: Object })
  fontStyle?: FontStyle;

  @Prop({ required: false })
  googleFont?: string;

  @Prop({ required: false })
  color?: string;

  @Prop({ required: false })
  backgroundColor?: string;

  @Prop({ required: false, type: String, enum: ['left', 'center', 'right'] })
  alignment?: 'left' | 'center' | 'right';

  @Prop({ required: false })
  variableName?: string;

  @Prop({ required: false, type: [String] })
  variables?: string[];

  @Prop({ required: false, type: Object })
  defaultValues?: Record<string, string>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const EditorElementSchema = SchemaFactory.createForClass(EditorElement);