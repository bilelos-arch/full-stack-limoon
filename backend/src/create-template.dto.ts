import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['contes-et-aventures-imaginaires', 'heros-du-quotidien', 'histoires-avec-des-animaux', 'histoires-educatives', 'valeurs-et-developpement-personnel', 'vie-quotidienne-et-ecole', 'fetes-et-occasions-speciales', 'exploration-et-science-fiction', 'culture-et-traditions', 'histoires-du-soir'])
  category: 'contes-et-aventures-imaginaires' | 'heros-du-quotidien' | 'histoires-avec-des-animaux' | 'histoires-educatives' | 'valeurs-et-developpement-personnel' | 'vie-quotidienne-et-ecole' | 'fetes-et-occasions-speciales' | 'exploration-et-science-fiction' | 'culture-et-traditions' | 'histoires-du-soir';

  @IsEnum(['boy', 'girl', 'unisex'])
  gender: 'boy' | 'girl' | 'unisex';

  @IsEnum(['3 ans - 5 ans', '6 ans - 8 ans', '9 ans - 11 ans', '12 ans - 15 ans'])
  ageRange: '3 ans - 5 ans' | '6 ans - 8 ans' | '9 ans - 11 ans' | '12 ans - 15 ans';

  @IsEnum(['français', 'anglais', 'arabe'])
  language: 'français' | 'anglais' | 'arabe';

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}