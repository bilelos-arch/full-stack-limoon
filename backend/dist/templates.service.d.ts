import { Model } from 'mongoose';
import { TemplateDocument } from './template.schema';
import { CreateTemplateDto } from './create-template.dto';
import { UpdateTemplateDto } from './update-template.dto';
import { EditorElement } from './editor-element.schema';
import { PdfGeneratorService } from './histoires/utils/pdf-generator.service';
export declare class TemplatesService {
    private templateModel;
    private editorElementModel;
    private pdfGeneratorService;
    private tempPreviewsDir;
    constructor(templateModel: Model<TemplateDocument>, editorElementModel: Model<EditorElement>, pdfGeneratorService: PdfGeneratorService);
    create(createTemplateDto: CreateTemplateDto, pdfPath: string, coverPath: string): Promise<TemplateDocument>;
    findAll(query?: any): Promise<TemplateDocument[]>;
    findOne(id: string): Promise<TemplateDocument>;
    update(id: string, updateTemplateDto: UpdateTemplateDto, files?: {
        pdf?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<TemplateDocument>;
    remove(id: string): Promise<void>;
    search(query: string, limit?: number): Promise<TemplateDocument[]>;
    generatePreview(templateId: string, variables: Record<string, any>): Promise<{
        pdfUrl: string;
    }>;
    private normalizeCategory;
    private normalizeLanguage;
    private analyzePdf;
}
