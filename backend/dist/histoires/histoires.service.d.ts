import { Model } from 'mongoose';
import { HistoireDocument } from './schemas/histoire.schema';
import { PdfGeneratorService } from './utils/pdf-generator.service';
import { TemplatesService } from '../templates.service';
import { UsersService } from '../users.service';
import { EditorElementsService } from '../editor-elements.service';
import { CreateHistoireDto } from './dto/create-histoire.dto';
import { UpdateHistoireDto } from './dto/update-histoire.dto';
import { PreviewHistoireDto } from './dto/preview-histoire.dto';
import { GenerateHistoireDto } from './dto/generate-histoire.dto';
export declare class HistoiresService {
    private histoireModel;
    private pdfGeneratorService;
    private templatesService;
    private usersService;
    private editorElementsService;
    private readonly logger;
    constructor(histoireModel: Model<HistoireDocument>, pdfGeneratorService: PdfGeneratorService, templatesService: TemplatesService, usersService: UsersService, editorElementsService: EditorElementsService);
    findByTemplate(templateId: string): Promise<HistoireDocument[]>;
    create(userId: string, createHistoireDto: CreateHistoireDto): Promise<HistoireDocument>;
    generatePreview(userId: string, previewDto: PreviewHistoireDto, uploadedImageUrls?: string[]): Promise<{
        previewUrls: string[];
        pdfUrl: string;
        histoireId: string;
    }>;
    generatePdf(userId: string, histoireId: string): Promise<HistoireDocument>;
    findOne(id: string, userId?: string): Promise<any>;
    findByUser(userId: string): Promise<HistoireDocument[]>;
    update(id: string, userId: string, updateHistoireDto: UpdateHistoireDto): Promise<HistoireDocument>;
    remove(id: string, userId: string): Promise<void>;
    generateHistoire(userId: string, generateDto: GenerateHistoireDto, uploadedImageUrls?: string[]): Promise<HistoireDocument>;
}
