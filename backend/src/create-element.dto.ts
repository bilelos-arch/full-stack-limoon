import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateElementDto {
  @IsEnum(['text', 'image'])
  @IsNotEmpty()
  type: 'text' | 'image';

  @IsNumber()
  @IsNotEmpty()
  pageIndex: number;

  @IsNumber()
  @IsNotEmpty()
  x: number;

  @IsNumber()
  @IsNotEmpty()
  y: number;

  @IsNumber()
  @IsNotEmpty()
  width: number;

  @IsNumber()
  @IsNotEmpty()
  height: number;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsString()
  font?: string;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsObject()
  fontStyle?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };

  @IsOptional()
  @IsString()
  googleFont?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsEnum(['left', 'center', 'right'])
  alignment?: 'left' | 'center' | 'right';

  @IsOptional()
  @IsString()
  variableName?: string;

  @IsOptional()
  @IsObject()
  defaultValues?: Record<string, string>;
}