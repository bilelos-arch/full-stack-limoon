import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './create-template.dto';
import { UpdateTemplateDto } from './update-template.dto';
import { PreviewTemplateDto } from './preview-template.dto';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    create(createTemplateDto: CreateTemplateDto, files: {
        pdf?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<import("./template.schema").TemplateDocument>;
    findAll(category?: string, gender?: string, ageRange?: string, isPublished?: string, language?: string): Promise<import("./template.schema").TemplateDocument[]>;
    search(query?: string, limit?: string): Promise<import("./template.schema").TemplateDocument[]>;
    findOne(id: string): Promise<import("./template.schema").TemplateDocument>;
    generatePreview(previewDto: PreviewTemplateDto): Promise<{
        pdfUrl: string;
    }>;
    update(id: string, updateTemplateDto: UpdateTemplateDto, files?: {
        pdf?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<import("./template.schema").TemplateDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
