import * as sharp from 'sharp';
import { promises as fs } from 'fs';
import { join } from 'path';

export class ImageConversionService {
    /**
     * Convert SVG DataURI to PNG file
     * @param dataUri SVG DataURI string
     * @param outputDir Directory to save the PNG file
     * @param filename Optional filename (without extension)
     * @returns Path to the generated PNG file (relative to uploads/)
     */
    async convertDataUriToPng(
        dataUri: string,
        outputDir: string = 'uploads/avatars',
        filename?: string
    ): Promise<string> {
        try {
            // Validate DataURI format
            if (!dataUri.startsWith('data:image/svg+xml')) {
                throw new Error('Invalid SVG DataURI format');
            }

            // Extract SVG content from DataURI
            const base64Match = dataUri.match(/^data:image\/svg\+xml;base64,(.+)$/);
            const utf8Match = dataUri.match(/^data:image\/svg\+xml;utf8,(.+)$/);
            const plainMatch = dataUri.match(/^data:image\/svg\+xml,(.+)$/);

            let svgContent: string;

            if (base64Match) {
                // Decode base64 encoded SVG
                svgContent = Buffer.from(base64Match[1], 'base64').toString('utf-8');
            } else if (utf8Match) {
                // Decode URI-encoded UTF-8 SVG
                svgContent = decodeURIComponent(utf8Match[1]);
            } else if (plainMatch) {
                // Decode URI-encoded SVG
                svgContent = decodeURIComponent(plainMatch[1]);
            } else {
                throw new Error('Could not parse SVG DataURI');
            }

            // Generate filename if not provided
            const outputFilename = filename || `avatar-${Date.now()}`;
            const outputPath = join(outputDir, `${outputFilename}.png`);

            // Ensure output directory exists
            await fs.mkdir(outputDir, { recursive: true });

            // Convert SVG to PNG using sharp
            // Sharp can handle SVG buffers directly
            await sharp(Buffer.from(svgContent))
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
                })
                .png()
                .toFile(outputPath);

            // Return relative path from uploads directory
            const relativePath = outputPath.replace(/^uploads\//, '');
            console.log(`✅ SVG DataURI converted to PNG: ${relativePath}`);

            return relativePath;
        } catch (error) {
            console.error('❌ Error converting SVG DataURI to PNG:', error);
            throw new Error(`Failed to convert SVG DataURI: ${error.message}`);
        }
    }

    /**
     * Check if a string is a DataURI
     */
    isDataUri(str: string): boolean {
        return typeof str === 'string' && str.startsWith('data:');
    }

    /**
     * Check if a DataURI is an SVG
     */
    isSvgDataUri(dataUri: string): boolean {
        return this.isDataUri(dataUri) && dataUri.startsWith('data:image/svg+xml');
    }
}
