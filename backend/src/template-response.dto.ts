export class TemplateResponseDto {
  _id: string;
  title: string;
  description: string;
  category: 'super hero' | 'aventure' | 'animal' | 'éducation';
  gender: 'boy' | 'girl' | 'unisex';
  ageRange: '3 ans - 5ans' | '6 ans - 8 ans' | '9 ans - 11 ans' | '12 ans - 15 ans';
  language: string;
  pdfPath: string;
  coverPath: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}