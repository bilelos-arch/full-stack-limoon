import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateHistoireDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsObject()
  @IsNotEmpty()
  variables: Record<string, any>;
}