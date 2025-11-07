export interface ImageMappingResult {
    found: boolean;
    imagePath?: string;
    variableName?: string;
    filename?: string;
    error?: string;
}
export declare class ImageMappingService {
    private readonly logger;
    private readonly uploadsDir;
    private readonly tempImagesDir;
    private readonly histoiresImagesDir;
    constructor();
    private ensureDirectoriesExist;
    findImageByVariable(variableName: string, imageVariableValue: string, uploadedImageUrls?: string[]): Promise<ImageMappingResult>;
    private findDirectMatch;
    private findByVariablePrefix;
    private findInTempImages;
    private findInAllDirectories;
    private searchDirectory;
    validateImageExists(imagePath: string): {
        valid: boolean;
        error?: string;
    };
    getImagePath(variableName: string, imageVariableValue: string, uploadedImageUrls?: string[]): Promise<string | null>;
    private extractBaseFilename;
    private isImageFile;
    listAvailableImages(): {
        directory: string;
        files: string[];
    }[];
    cleanupTempImages(olderThanDays?: number): Promise<number>;
}
