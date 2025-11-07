import { TemplateDocument } from '../../template.schema';
import { EditorElementsService } from '../../editor-elements.service';
import { ImageMappingService } from './image-mapping.service';
import { CloudinaryService } from '../../cloudinary.service';
export declare class PdfGeneratorService {
    private editorElementsService;
    private imageMappingService;
    private cloudinaryService;
    private readonly logger;
    private uploadsDir;
    private previewsDir;
    private cartoonifyServiceUrl;
    constructor(editorElementsService: EditorElementsService, imageMappingService: ImageMappingService, cloudinaryService: CloudinaryService);
    generatePreview(template: TemplateDocument, variables: Record<string, any>, uploadedImageUrls?: string[]): Promise<string[]>;
    generateFinalPdf(template: TemplateDocument, variables: Record<string, any>, uploadedImageUrls?: string[]): Promise<string>;
    validateVariables(template: TemplateDocument, variables: Record<string, any>, uploadedImageUrls?: string[]): Promise<{
        valid: boolean;
        missingVariables?: string[];
        missingImages?: string[];
        imageErrors?: string[];
    }>;
    private applyVariablesToPdf;
    private replaceTextVariables;
    private replaceImageVariables;
    private convertPdfToImages;
    private cartoonifyImage;
    private validatePngBuffer;
    private hexToRgb;
}
