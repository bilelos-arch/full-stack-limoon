import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class PreviewHistoireDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsObject()
  @IsNotEmpty()
  variables: Record<string, any>;
}