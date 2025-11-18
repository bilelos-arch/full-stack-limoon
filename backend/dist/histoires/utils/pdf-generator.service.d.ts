import { TemplateDocument } from '../../template.schema';
import { EditorElementsService } from '../../editor-elements.service';
import { ImageMappingService } from './image-mapping.service';
export declare class PdfGeneratorService {
    private editorElementsService;
    private imageMappingService;
    private readonly logger;
    private uploadsDir;
    private tempImagesDir;
    private previewsDir;
    private pdfsDir;
    private cartoonifyServiceUrl;
    constructor(editorElementsService: EditorElementsService, imageMappingService: ImageMappingService);
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
    private convertPdfToImagesOptimized;
    private validateDataUrl;
    private decodeBase64Data;
    private validatePngBuffer;
    private hexToRgb;
}
