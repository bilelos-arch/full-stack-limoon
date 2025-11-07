import { HistoiresService } from './histoires.service';
import { TemplatesService } from '../templates.service';
import { CreateHistoireDto } from './dto/create-histoire.dto';
import { UpdateHistoireDto } from './dto/update-histoire.dto';
import { CloudinaryService } from '../cloudinary.service';
export declare class HistoiresController {
    private readonly histoiresService;
    private readonly templatesService;
    private readonly cloudinaryService;
    private readonly logger;
    constructor(histoiresService: HistoiresService, templatesService: TemplatesService, cloudinaryService: CloudinaryService);
    findByTemplate(templateId: string): Promise<import("./schemas/histoire.schema").HistoireDocument[]>;
    findByUser(req: any): Promise<import("./schemas/histoire.schema").HistoireDocument[]>;
    findOne(id: string, req: any): Promise<any>;
    create(createHistoireDto: CreateHistoireDto, req: any): Promise<import("./schemas/histoire.schema").HistoireDocument>;
    update(id: string, updateHistoireDto: UpdateHistoireDto, req: any): Promise<import("./schemas/histoire.schema").HistoireDocument>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    generatePreview(body: any, files: Record<string, Express.Multer.File[]>, req: any): Promise<{
        success: boolean;
        previewUrls: string[];
        pdfUrl: string;
        histoireId: string;
        processingSummary: {
            uploadedImages: number;
            mappedVariables: string[];
            fileErrors: string[];
        };
    }>;
    generatePdf(histoireId: string, req: any): Promise<import("./schemas/histoire.schema").HistoireDocument>;
    generateHistoire(body: any, files: Record<string, Express.Multer.File[]>, req: any): Promise<{
        success: boolean;
        histoire: import("./schemas/histoire.schema").HistoireDocument;
        processingSummary: {
            uploadedImages: number;
            mappedVariables: string[];
            fileErrors: string[];
        };
    }>;
    getTemplateVariables(templateId: string): Promise<{
        variables: string[];
        defaultValues: {
            nom: string;
            âge: string;
            date: string;
            image: string;
        };
    }>;
}
