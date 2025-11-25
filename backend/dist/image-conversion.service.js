"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageConversionService = void 0;
const sharp = require("sharp");
const fs_1 = require("fs");
const path_1 = require("path");
class ImageConversionService {
    async convertDataUriToPng(dataUri, outputDir = 'uploads/avatars', filename) {
        try {
            if (!dataUri.startsWith('data:image/svg+xml')) {
                throw new Error('Invalid SVG DataURI format');
            }
            const base64Match = dataUri.match(/^data:image\/svg\+xml;base64,(.+)$/);
            const utf8Match = dataUri.match(/^data:image\/svg\+xml;utf8,(.+)$/);
            const plainMatch = dataUri.match(/^data:image\/svg\+xml,(.+)$/);
            let svgContent;
            if (base64Match) {
                svgContent = Buffer.from(base64Match[1], 'base64').toString('utf-8');
            }
            else if (utf8Match) {
                svgContent = decodeURIComponent(utf8Match[1]);
            }
            else if (plainMatch) {
                svgContent = decodeURIComponent(plainMatch[1]);
            }
            else {
                throw new Error('Could not parse SVG DataURI');
            }
            const outputFilename = filename || `avatar-${Date.now()}`;
            const outputPath = (0, path_1.join)(outputDir, `${outputFilename}.png`);
            await fs_1.promises.mkdir(outputDir, { recursive: true });
            await sharp(Buffer.from(svgContent))
                .resize(512, 512, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
                .png()
                .toFile(outputPath);
            const relativePath = outputPath.replace(/^uploads\//, '');
            console.log(`✅ SVG DataURI converted to PNG: ${relativePath}`);
            return relativePath;
        }
        catch (error) {
            console.error('❌ Error converting SVG DataURI to PNG:', error);
            throw new Error(`Failed to convert SVG DataURI: ${error.message}`);
        }
    }
    isDataUri(str) {
        return typeof str === 'string' && str.startsWith('data:');
    }
    isSvgDataUri(dataUri) {
        return this.isDataUri(dataUri) && dataUri.startsWith('data:image/svg+xml');
    }
}
exports.ImageConversionService = ImageConversionService;
//# sourceMappingURL=image-conversion.service.js.map