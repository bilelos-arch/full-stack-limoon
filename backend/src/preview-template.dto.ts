import { IsString, IsOptional, IsObject } from 'class-validator';

export class PreviewTemplateDto {
  @IsString()
  templateId: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}