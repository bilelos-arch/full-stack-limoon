"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ImageMappingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageMappingService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let ImageMappingService = ImageMappingService_1 = class ImageMappingService {
    constructor() {
        this.logger = new common_1.Logger(ImageMappingService_1.name);
        this.uploadsDir = './uploads';
        this.tempImagesDir = './uploads/temp-images';
        this.histoiresImagesDir = './uploads/histoires-images';
        this.previewsDir = './uploads/previews';
        this.pdfsDir = './uploads/pdfs';
        this.ensureDirectoriesExist();
    }
    ensureDirectoriesExist() {
        const directories = [this.uploadsDir, this.tempImagesDir, this.histoiresImagesDir, this.previewsDir, this.pdfsDir];
        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.logger.log(`Created directory: ${dir}`);
            }
        });
    }
    async findImageByVariable(variableName, imageVariableValue, uploadedImageUrls = []) {
        this.logger.log(`[IMAGE-MAPPING] 🔍 Starting image search: variable="${variableName}", value="${imageVariableValue}"`);
        this.logger.log(`[IMAGE-MAPPING] 📁 Available uploaded URLs:`, uploadedImageUrls);
        this.logger.log(`[IMAGE-MAPPING] 📂 Current working directory: ${process.cwd()}`);
        this.logger.log(`[IMAGE-MAPPING] 📂 Uploads dir: ${this.uploadsDir}, exists: ${fs.existsSync(this.uploadsDir)}`);
        this.logger.log(`[IMAGE-MAPPING] 📂 Temp images dir: ${this.tempImagesDir}, exists: ${fs.existsSync(this.tempImagesDir)}`);
        try {
            if (uploadedImageUrls && uploadedImageUrls.length > 0) {
                this.logger.log(`[IMAGE-MAPPING] 🔍 Method 1: Direct match search in ${uploadedImageUrls.length} uploaded URLs`);
                const directMatch = this.findDirectMatch(imageVariableValue, uploadedImageUrls);
                if (directMatch.found) {
                    this.logger.log(`[IMAGE-MAPPING] ✅ Direct match found: ${directMatch.imagePath}`);
                    return directMatch;
                }
                else {
                    this.logger.log(`[IMAGE-MAPPING] ❌ No direct match found in uploaded URLs`);
                }
            }
            else {
                this.logger.log(`[IMAGE-MAPPING] ⚠️ No uploaded URLs provided, skipping direct match`);
            }
            if (uploadedImageUrls && uploadedImageUrls.length > 0) {
                this.logger.log(`[IMAGE-MAPPING] 🔍 Method 2: Prefix match search for variable "${variableName}"`);
                const prefixMatch = this.findByVariablePrefix(variableName, uploadedImageUrls);
                if (prefixMatch.found) {
                    this.logger.log(`[IMAGE-MAPPING] ✅ Prefix match found: ${prefixMatch.imagePath}`);
                    return prefixMatch;
                }
                else {
                    this.logger.log(`[IMAGE-MAPPING] ❌ No prefix match found for "${variableName}"`);
                }
            }
            const tempImagesMatch = await this.findInTempImages(variableName, imageVariableValue);
            if (tempImagesMatch.found) {
                this.logger.log(`[IMAGE-MAPPING] ✅ Temp images match found: ${tempImagesMatch.imagePath}`);
                return tempImagesMatch;
            }
            const exhaustiveMatch = await this.findInAllDirectories(variableName, imageVariableValue);
            if (exhaustiveMatch.found) {
                this.logger.log(`[IMAGE-MAPPING] ✅ Exhaustive search found: ${exhaustiveMatch.imagePath}`);
                return exhaustiveMatch;
            }
            const errorMsg = `Image not found for variable "${variableName}" with value "${imageVariableValue}"`;
            this.logger.error(`[IMAGE-MAPPING] ❌ ${errorMsg}`);
            return {
                found: false,
                error: errorMsg,
                variableName
            };
        }
        catch (error) {
            const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
            const errorMsg = `Error searching for image "${variableName}": ${errorMessage}`;
            this.logger.error(`[IMAGE-MAPPING] ❌ ${errorMsg}`, error.stack || error);
            return {
                found: false,
                variableName,
                error: errorMsg
            };
        }
    }
    findDirectMatch(imageVariableValue, uploadedImageUrls) {
        for (const uploadedPath of uploadedImageUrls) {
            const uploadedFilename = path.basename(uploadedPath);
            if (uploadedFilename === imageVariableValue) {
                return {
                    found: true,
                    imagePath: uploadedPath,
                    filename: uploadedFilename
                };
            }
            const filenameWithoutSuffix = this.extractBaseFilename(uploadedFilename);
            if (filenameWithoutSuffix === imageVariableValue) {
                return {
                    found: true,
                    imagePath: uploadedPath,
                    filename: uploadedFilename
                };
            }
        }
        return { found: false };
    }
    findByVariablePrefix(variableName, uploadedImageUrls) {
        for (const uploadedPath of uploadedImageUrls) {
            const uploadedFilename = path.basename(uploadedPath);
            if (uploadedFilename.startsWith(`${variableName}-`)) {
                return {
                    found: true,
                    imagePath: uploadedPath,
                    filename: uploadedFilename
                };
            }
        }
        return { found: false };
    }
    async findInTempImages(variableName, imageVariableValue) {
        try {
            if (!fs.existsSync(this.tempImagesDir)) {
                return { found: false };
            }
            const files = fs.readdirSync(this.tempImagesDir);
            for (const filename of files) {
                const filePath = path.join(this.tempImagesDir, filename);
                if (!this.isImageFile(filename)) {
                    continue;
                }
                if (filename === imageVariableValue) {
                    return {
                        found: true,
                        imagePath: filePath,
                        filename
                    };
                }
                if (filename.startsWith(`${variableName}-`)) {
                    return {
                        found: true,
                        imagePath: filePath,
                        filename
                    };
                }
                const baseFilename = this.extractBaseFilename(filename);
                if (baseFilename === imageVariableValue) {
                    return {
                        found: true,
                        imagePath: filePath,
                        filename
                    };
                }
            }
            return { found: false };
        }
        catch (error) {
            const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
            this.logger.error(`[IMAGE-MAPPING] Error in temp-images search: ${errorMessage}`, error.stack || error);
            return { found: false };
        }
    }
    async findInAllDirectories(variableName, imageVariableValue) {
        const searchDirectories = [
            this.uploadsDir,
            this.tempImagesDir,
            this.histoiresImagesDir,
            this.previewsDir,
            this.pdfsDir
        ];
        for (const searchDir of searchDirectories) {
            if (!fs.existsSync(searchDir)) {
                continue;
            }
            try {
                const result = await this.searchDirectory(searchDir, variableName, imageVariableValue);
                if (result.found) {
                    return result;
                }
            }
            catch (error) {
                const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
                this.logger.warn(`[IMAGE-MAPPING] Error searching directory ${searchDir}: ${errorMessage}`, error.stack || error);
            }
        }
        return { found: false };
    }
    async searchDirectory(searchDir, variableName, imageVariableValue) {
        const files = fs.readdirSync(searchDir);
        for (const filename of files) {
            const filePath = path.join(searchDir, filename);
            if (fs.statSync(filePath).isDirectory()) {
                continue;
            }
            if (!this.isImageFile(filename)) {
                continue;
            }
            if (filename === imageVariableValue) {
                return {
                    found: true,
                    imagePath: filePath,
                    filename
                };
            }
            if (filename.startsWith(`${variableName}-`)) {
                return {
                    found: true,
                    imagePath: filePath,
                    filename
                };
            }
        }
        return { found: false };
    }
    validateImageExists(imagePath) {
        try {
            if (!fs.existsSync(imagePath)) {
                return { valid: false, error: `Image file does not exist: ${imagePath}` };
            }
            const stats = fs.statSync(imagePath);
            if (stats.size === 0) {
                return { valid: false, error: `Image file is empty: ${imagePath}` };
            }
            const filename = path.basename(imagePath);
            if (!this.isImageFile(filename)) {
                return { valid: false, error: `File is not a valid image: ${imagePath}` };
            }
            return { valid: true };
        }
        catch (error) {
            const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
            return { valid: false, error: `Error validating image: ${errorMessage}` };
        }
    }
    getImagePath(variableName, imageVariableValue, uploadedImageUrls = []) {
        return this.findImageByVariable(variableName, imageVariableValue, uploadedImageUrls)
            .then(result => result.found ? result.imagePath || null : null);
    }
    extractBaseFilename(filename) {
        const parts = filename.split('-');
        if (parts.length >= 3) {
            const ext = path.extname(filename);
            const variablePart = parts[0];
            return `${variablePart}${ext}`;
        }
        return filename;
    }
    isImageFile(filename) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const ext = path.extname(filename).toLowerCase();
        return imageExtensions.includes(ext);
    }
    listAvailableImages() {
        const directories = [
            { path: this.tempImagesDir, name: 'temp-images' },
            { path: this.histoiresImagesDir, name: 'histoires-images' },
            { path: this.uploadsDir, name: 'uploads' },
            { path: this.previewsDir, name: 'previews' },
            { path: this.pdfsDir, name: 'pdfs' }
        ];
        return directories.map(dir => {
            let files = [];
            if (fs.existsSync(dir.path)) {
                try {
                    files = fs.readdirSync(dir.path)
                        .filter(file => this.isImageFile(file))
                        .sort();
                }
                catch (error) {
                    const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
                    this.logger.warn(`Error reading directory ${dir.path}: ${errorMessage}`, error.stack || error);
                }
            }
            return {
                directory: dir.name,
                files
            };
        });
    }
    async cleanupTempImages(olderThanDays = 1) {
        if (!fs.existsSync(this.tempImagesDir)) {
            return 0;
        }
        const files = fs.readdirSync(this.tempImagesDir);
        const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
        let cleanedCount = 0;
        for (const filename of files) {
            const filePath = path.join(this.tempImagesDir, filename);
            try {
                const stats = fs.statSync(filePath);
                if (stats.mtime.getTime() < cutoffTime) {
                    fs.unlinkSync(filePath);
                    cleanedCount++;
                    this.logger.log(`Cleaned up temp image: ${filename}`);
                }
            }
            catch (error) {
                const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
                this.logger.warn(`Error cleaning up ${filename}: ${errorMessage}`, error.stack || error);
            }
        }
        return cleanedCount;
    }
};
exports.ImageMappingService = ImageMappingService;
exports.ImageMappingService = ImageMappingService = ImageMappingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ImageMappingService);
//# sourceMappingURL=image-mapping.service.js.map