import { IsEmail, IsNotEmpty, IsString, IsOptional, IsIn, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class ChildAvatarDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @IsString()
  @IsIn(['boy', 'girl', 'unisex'])
  gender?: 'boy' | 'girl' | 'unisex';

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsString()
  hairType?: string;

  @IsOptional()
  @IsString()
  hairColor?: string;

  @IsOptional()
  @IsString()
  skinTone?: string;

  @IsOptional()
  @IsString()
  eyes?: string;

  @IsOptional()
  @IsString()
  eyebrows?: string;

  @IsOptional()
  @IsString()
  mouth?: string;

  @IsOptional()
  @IsBoolean()
  glasses?: boolean;

  @IsOptional()
  @IsString()
  glassesStyle?: string;

  @IsOptional()
  @IsString()
  accessories?: string;

  @IsOptional()
  @IsString()
  earrings?: string;

  @IsOptional()
  @IsString()
  features?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'user'])
  role?: 'admin' | 'user';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChildAvatarDto)
  child?: ChildAvatarDto;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  childAvatar?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
  };
}