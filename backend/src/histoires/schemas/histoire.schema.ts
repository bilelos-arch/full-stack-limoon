import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HistoireDocument = Histoire & Document;

@Schema({ timestamps: true })
export class Histoire {
  @Prop({ type: Types.ObjectId, ref: 'Template', required: true })
  templateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Object, required: true })
  variables: Record<string, any>;

  @Prop({ type: String })
  previewUrl?: string;

  @Prop({ type: String })
  pdfUrl?: string;
}

export const HistoireSchema = SchemaFactory.createForClass(Histoire);