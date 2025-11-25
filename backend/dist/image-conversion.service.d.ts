export declare class ImageConversionService {
    convertDataUriToPng(dataUri: string, outputDir?: string, filename?: string): Promise<string>;
    isDataUri(str: string): boolean;
    isSvgDataUri(dataUri: string): boolean;
}
