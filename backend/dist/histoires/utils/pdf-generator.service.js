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
var PdfGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const pdf_lib_1 = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const pdf2pic = require("pdf2pic");
const sharp = require("sharp");
const editor_elements_service_1 = require("../../editor-elements.service");
const image_mapping_service_1 = require("./image-mapping.service");
let PdfGeneratorService = PdfGeneratorService_1 = class PdfGeneratorService {
    constructor(editorElementsService, imageMappingService) {
        this.editorElementsService = editorElementsService;
        this.imageMappingService = imageMappingService;
        this.logger = new common_1.Logger(PdfGeneratorService_1.name);
        this.uploadsDir = './uploads';
        this.previewsDir = './uploads/previews';
        this.cartoonifyServiceUrl = process.env.CARTOONIFY_SERVICE_URL || 'http://localhost:3001';
    }
    async generatePreview(template, variables, uploadedImagePaths) {
        try {
            this.logger.log(`[PDF-GENERATOR] Generating preview for template ${template._id}`);
            this.logger.log(`[PDF-GENERATOR] Variables:`, JSON.stringify(variables, null, 2));
            this.logger.log(`[PDF-GENERATOR] Uploaded image paths:`, uploadedImagePaths);
            if (!fs.existsSync(this.previewsDir)) {
                fs.mkdirSync(this.previewsDir, { recursive: true });
            }
            const templatePath = path.join(this.uploadsDir, template.pdfPath);
            if (!fs.existsSync(templatePath)) {
                throw new common_1.BadRequestException('Template PDF not found');
            }
            const templateBytes = fs.readFileSync(templatePath);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(templateBytes);
            const editorElements = await this.editorElementsService.findAllByTemplate(template._id.toString());
            await this.applyVariablesToPdf(pdfDoc, editorElements, variables, template, uploadedImagePaths);
            const tempPdfFilename = `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
            const tempPdfPath = path.join(this.previewsDir, tempPdfFilename);
            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
            fs.writeFileSync(tempPdfPath, pdfBytes);
            let previewImageUrls = [];
            try {
                previewImageUrls = await this.convertPdfToImages(tempPdfPath);
            }
            catch (error) {
                const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
                this.logger.error(`PDF to image conversion failed: ${errorMessage}`, error.stack || error);
                if (errorMessage.includes('GraphicsMagick') || errorMessage.includes('ImageMagick') || errorMessage.includes('spawn')) {
                    this.logger.warn('Image conversion failed due to missing GraphicsMagick/ImageMagick binaries. This is expected in some environments.');
                    previewImageUrls = [];
                }
                else {
                    throw new common_1.BadRequestException(`Failed to convert PDF to images: ${errorMessage}`);
                }
            }
            fs.unlinkSync(tempPdfPath);
            this.logger.log(`[PDF-GENERATOR] Preview generated successfully: ${previewImageUrls.length} images`);
            this.logger.log(`[PDF-GENERATOR] Preview image URLs:`, previewImageUrls);
            return previewImageUrls;
        }
        catch (error) {
            const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
            this.logger.error(`Preview generation error: ${errorMessage}`, error.stack || error);
            throw new common_1.BadRequestException(`Failed to generate preview: ${errorMessage}`);
        }
    }
    async generateFinalPdf(template, variables, uploadedImagePaths) {
        try {
            this.logger.log(`Generating final PDF for template ${template._id}`);
            const templatePath = path.join(this.uploadsDir, template.pdfPath);
            if (!fs.existsSync(templatePath)) {
                throw new common_1.BadRequestException('Template PDF not found');
            }
            const templateBytes = fs.readFileSync(templatePath);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(templateBytes);
            const editorElements = await this.editorElementsService.findAllByTemplate(template._id.toString());
            await this.applyVariablesToPdf(pdfDoc, editorElements, variables, template, uploadedImagePaths);
            const finalBytes = await pdfDoc.save({ useObjectStreams: false });
            const finalFilename = `generated-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
            const finalPath = path.join(this.uploadsDir, finalFilename);
            fs.writeFileSync(finalPath, finalBytes);
            this.logger.log(`Final PDF generated successfully: ${finalFilename}`);
            return finalFilename;
        }
        catch (error) {
            const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
            this.logger.error(`PDF generation error: ${errorMessage}`, error.stack || error);
            throw new common_1.BadRequestException(`Failed to generate PDF: ${errorMessage}`);
        }
    }
    async validateVariables(template, variables, uploadedImagePaths) {
        this.logger.log(`[VALIDATION] Starting comprehensive validation for template ${template._id}`);
        this.logger.log(`[VALIDATION] Variables provided:`, Object.keys(variables));
        this.logger.log(`[VALIDATION] Uploaded image paths:`, uploadedImagePaths);
        const editorElements = await this.editorElementsService.findAllByTemplate(template._id.toString());
        const requiredVars = new Set();
        const imageVariables = new Set();
        const textVariables = new Set();
        for (const element of editorElements) {
            if (element.type === 'image') {
                if (element.variables && element.variables.length > 0) {
                    element.variables.forEach(varName => imageVariables.add(varName));
                }
                if (element.variableName) {
                    imageVariables.add(element.variableName);
                }
            }
            else if (element.type === 'text') {
                if (element.variables && element.variables.length > 0) {
                    element.variables.forEach(varName => textVariables.add(varName));
                }
                if (element.variableName) {
                    textVariables.add(element.variableName);
                }
            }
            if (element.variables && element.variables.length > 0) {
                element.variables.forEach(varName => requiredVars.add(varName));
            }
            if (element.variableName) {
                requiredVars.add(element.variableName);
            }
        }
        this.logger.log(`[PDF-GENERATOR] Validation: ${requiredVars.size} total vars, ${imageVariables.size} image vars, ${textVariables.size} text vars`);
        const missingVariables = [];
        const missingImages = [];
        const imageErrors = [];
        for (const varName of requiredVars) {
            if (!(varName in variables)) {
                missingVariables.push(varName);
                this.logger.warn(`[PDF-GENERATOR] Missing required variable: ${varName}`);
            }
        }
        for (const imageVarName of imageVariables) {
            const imageVarValue = variables[imageVarName];
            if (!imageVarValue) {
                missingImages.push(imageVarName);
                this.logger.warn(`[PDF-GENERATOR] Missing required image variable: ${imageVarName}`);
                continue;
            }
            if (typeof imageVarValue !== 'string') {
                imageErrors.push(`Image variable "${imageVarName}" must be a string, got ${typeof imageVarValue}`);
                this.logger.warn(`[PDF-GENERATOR] Image variable "${imageVarName}" has invalid type: ${typeof imageVarValue}`);
                continue;
            }
            try {
                const mappingResult = await this.imageMappingService.findImageByVariable(imageVarName, imageVarValue, uploadedImagePaths);
                if (!mappingResult.found) {
                    imageErrors.push(`Image not found for variable "${imageVarName}" with value "${imageVarValue}": ${mappingResult.error}`);
                    this.logger.error(`[PDF-GENERATOR] Image validation failed for "${imageVarName}": ${mappingResult.error}`);
                }
                else {
                    this.logger.log(`[PDF-GENERATOR] ✅ Image variable "${imageVarName}" validated successfully`);
                }
            }
            catch (error) {
                imageErrors.push(`Error validating image "${imageVarName}": ${error.message}`);
                this.logger.error(`[PDF-GENERATOR] Image validation error for "${imageVarName}": ${error.message}`, error.stack);
            }
        }
        const isValid = missingVariables.length === 0 && missingImages.length === 0 && imageErrors.length === 0;
        if (isValid) {
            this.logger.log(`[VALIDATION] ✅ All variables and images validated successfully`);
        }
        else {
            this.logger.error(`[VALIDATION] ❌ Validation failed: ${missingVariables.length} missing vars, ${missingImages.length} missing images, ${imageErrors.length} image errors`);
            if (missingVariables.length > 0)
                this.logger.error(`[VALIDATION] Missing variables: ${missingVariables.join(', ')}`);
            if (missingImages.length > 0)
                this.logger.error(`[VALIDATION] Missing images: ${missingImages.join(', ')}`);
            if (imageErrors.length > 0)
                this.logger.error(`[VALIDATION] Image errors: ${imageErrors.join(', ')}`);
        }
        return {
            valid: isValid,
            missingVariables: missingVariables.length > 0 ? missingVariables : undefined,
            missingImages: missingImages.length > 0 ? missingImages : undefined,
            imageErrors: imageErrors.length > 0 ? imageErrors : undefined,
        };
    }
    async applyVariablesToPdf(pdfDoc, editorElements, variables, template, uploadedImagePaths) {
        this.logger.log(`Applying ${Object.keys(variables).length} variables to PDF with ${editorElements.length} elements`);
        const defaultVars = {};
        for (const element of editorElements) {
            if (element.defaultValues) {
                Object.assign(defaultVars, element.defaultValues);
            }
        }
        const mergedVars = { ...defaultVars, ...variables };
        this.logger.log(`Merged variables: ${Object.keys(mergedVars).length} total (defaults: ${Object.keys(defaultVars).length}, user: ${Object.keys(variables).length})`);
        const elementsByPage = editorElements.reduce((acc, element) => {
            if (!acc[element.pageIndex]) {
                acc[element.pageIndex] = [];
            }
            acc[element.pageIndex].push(element);
            return acc;
        }, {});
        for (const [pageIndexStr, elements] of Object.entries(elementsByPage)) {
            const pageIndex = parseInt(pageIndexStr);
            const pages = pdfDoc.getPages();
            if (pageIndex >= pages.length) {
                this.logger.warn(`Page index ${pageIndex} exceeds PDF page count ${pages.length}`);
                continue;
            }
            const page = pages[pageIndex];
            const textElements = elements.filter(el => el.type === 'text');
            await this.replaceTextVariables(page, textElements, mergedVars, template);
            const imageElements = elements.filter(el => el.type === 'image');
            await this.replaceImageVariables(page, imageElements, mergedVars, template, pdfDoc, uploadedImagePaths);
        }
        this.logger.log('Variables applied successfully to PDF');
    }
    async replaceTextVariables(page, textElements, variables, template) {
        this.logger.log(`Processing ${textElements.length} text elements`);
        for (const element of textElements) {
            if (!element.textContent || !element.variables?.length) {
                continue;
            }
            let processedText = element.textContent;
            for (const varName of element.variables) {
                const varValue = variables[varName];
                if (varValue !== undefined) {
                    const regex = new RegExp(`\\(${varName}\\)`, 'g');
                    processedText = processedText.replace(regex, String(varValue));
                }
            }
            const pageWidth = template.dimensions?.width || 595;
            const pageHeight = template.dimensions?.height || 842;
            const x = (element.x / 100) * pageWidth;
            const y = pageHeight - ((element.y / 100) * pageHeight);
            const width = (element.width / 100) * pageWidth;
            const height = (element.height / 100) * pageHeight;
            let font;
            try {
                if (element.googleFont) {
                    font = await page.doc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
                }
                else {
                    font = await page.doc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
                }
            }
            catch (error) {
                this.logger.warn(`Failed to load font, using default: ${error.message}`);
                font = await page.doc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            }
            const fontSize = element.fontSize || Math.min(height * 0.8, width / processedText.length * 2) || 12;
            page.drawText(processedText, {
                x,
                y: y - fontSize,
                size: fontSize,
                font,
                color: element.color ? (0, pdf_lib_1.rgb)(parseInt(element.color.slice(1, 3), 16) / 255, parseInt(element.color.slice(3, 5), 16) / 255, parseInt(element.color.slice(5, 7), 16) / 255) : (0, pdf_lib_1.rgb)(0, 0, 0),
                maxWidth: width,
            });
            this.logger.debug(`Text element rendered: "${processedText}" at (${x}, ${y})`);
        }
    }
    async replaceImageVariables(page, imageElements, variables, template, pdfDoc, uploadedImagePaths) {
        this.logger.log(`[PDF-GENERATOR] Processing ${imageElements.length} image elements with robust mapping`);
        this.logger.log(`[PDF-GENERATOR] Available variables:`, Object.keys(variables));
        this.logger.log(`[PDF-GENERATOR] Uploaded image paths:`, uploadedImagePaths);
        let processedImages = 0;
        let failedImages = 0;
        const imageErrors = [];
        for (const element of imageElements) {
            this.logger.log(`[PDF-GENERATOR] Processing image element:`, {
                id: element.id,
                variableName: element.variableName,
                type: element.type,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height
            });
            if (!element.variableName) {
                this.logger.warn(`[PDF-GENERATOR] Skipping element ${element.id} - no variableName`);
                failedImages++;
                imageErrors.push(`Element ${element.id}: missing variableName`);
                continue;
            }
            const imageVar = variables[element.variableName];
            this.logger.log(`[PDF-GENERATOR] Image variable "${element.variableName}" value:`, imageVar, `type: ${typeof imageVar}`);
            if (!imageVar) {
                this.logger.warn(`[PDF-GENERATOR] No value found for image variable: ${element.variableName}`);
                failedImages++;
                imageErrors.push(`Variable "${element.variableName}": no value provided`);
                continue;
            }
            if (typeof imageVar !== 'string') {
                this.logger.warn(`[PDF-GENERATOR] Invalid image variable type for ${element.variableName}: ${typeof imageVar}`);
                failedImages++;
                imageErrors.push(`Variable "${element.variableName}": invalid type (${typeof imageVar})`);
                continue;
            }
            try {
                let imageBytes;
                let imageFormat;
                if (imageVar.startsWith('data:image/')) {
                    this.logger.log(`[PDF-GENERATOR] 🔍 Detected data URL for variable "${element.variableName}"`);
                    const dataUrlMatch = imageVar.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
                    if (!dataUrlMatch) {
                        this.logger.error(`[PDF-GENERATOR] ❌ Invalid data URL format for variable "${element.variableName}"`);
                        failedImages++;
                        imageErrors.push(`Variable "${element.variableName}": invalid data URL format`);
                        continue;
                    }
                    const [, format, base64Data] = dataUrlMatch;
                    imageFormat = format.toLowerCase();
                    this.logger.log(`[PDF-GENERATOR] 📋 Extracted format: ${imageFormat}, data length: ${base64Data.length}`);
                    try {
                        imageBytes = Buffer.from(base64Data, 'base64');
                        this.logger.log(`[PDF-GENERATOR] ✅ Successfully decoded base64 data (${imageBytes.length} bytes)`);
                    }
                    catch (decodeError) {
                        this.logger.error(`[PDF-GENERATOR] ❌ Failed to decode base64 data: ${decodeError.message}`);
                        failedImages++;
                        imageErrors.push(`Variable "${element.variableName}": base64 decode failed`);
                        continue;
                    }
                    if (imageFormat === 'png') {
                        const isValidPng = this.validatePngBuffer(imageBytes);
                        if (!isValidPng) {
                            this.logger.error(`[PDF-GENERATOR] ❌ Invalid PNG data for variable "${element.variableName}"`);
                            failedImages++;
                            imageErrors.push(`Variable "${element.variableName}": invalid PNG data`);
                            continue;
                        }
                        this.logger.log(`[PDF-GENERATOR] ✅ PNG validation passed for data URL`);
                    }
                }
                else {
                    const mappingResult = await this.imageMappingService.findImageByVariable(element.variableName, imageVar, uploadedImagePaths);
                    if (!mappingResult.found || !mappingResult.imagePath) {
                        const errorMsg = mappingResult.error || `Image not found for variable "${element.variableName}"`;
                        this.logger.error(`[PDF-GENERATOR] ❌ ${errorMsg}`);
                        failedImages++;
                        imageErrors.push(`Variable "${element.variableName}": ${errorMsg}`);
                        continue;
                    }
                    let imagePath = mappingResult.imagePath;
                    this.logger.log(`[PDF-GENERATOR] ✅ Found image path: ${imagePath} (filename: ${mappingResult.filename})`);
                    const validation = this.imageMappingService.validateImageExists(imagePath);
                    if (!validation.valid) {
                        this.logger.error(`[PDF-GENERATOR] ❌ Image validation failed: ${validation.error}`);
                        failedImages++;
                        imageErrors.push(`Variable "${element.variableName}": ${validation.error}`);
                        continue;
                    }
                    imageBytes = fs.readFileSync(imagePath);
                    imageFormat = path.extname(imagePath).toLowerCase().replace('.', '');
                    this.logger.log(`[PDF-GENERATOR] ✅ Loaded image from file: ${imageFormat} (${imageBytes.length} bytes)`);
                }
                const pageWidth = template.dimensions?.width || 595;
                const pageHeight = template.dimensions?.height || 842;
                const x = (element.x / 100) * pageWidth;
                const y = pageHeight - ((element.y / 100) * pageHeight);
                const width = (element.width / 100) * pageWidth;
                const height = (element.height / 100) * pageHeight;
                this.logger.log(`[PDF-GENERATOR] Calculated position: x=${x}, y=${y}, width=${width}, height=${height}`);
                let pdfImage;
                if (imageFormat === 'png') {
                    pdfImage = await pdfDoc.embedPng(imageBytes);
                    this.logger.log(`[PDF-GENERATOR] ✅ Embedded PNG image`);
                }
                else if (imageFormat === 'jpg' || imageFormat === 'jpeg') {
                    try {
                        this.logger.log(`[PDF-GENERATOR] 🔄 Converting JPG to PNG for variable "${element.variableName}"`);
                        const convertedBuffer = await sharp(imageBytes).png().toBuffer();
                        pdfImage = await pdfDoc.embedPng(convertedBuffer);
                        this.logger.log(`[PDF-GENERATOR] ✅ Successfully converted and embedded JPG as PNG`);
                    }
                    catch (conversionError) {
                        this.logger.warn(`[PDF-GENERATOR] JPG conversion failed, trying direct embedding: ${conversionError.message}`);
                        pdfImage = await pdfDoc.embedJpg(imageBytes);
                        this.logger.log(`[PDF-GENERATOR] ✅ Embedded JPG image (fallback)`);
                    }
                }
                else if (imageFormat === 'gif' || imageFormat === 'webp') {
                    try {
                        this.logger.log(`[PDF-GENERATOR] 🔄 Converting ${imageFormat.toUpperCase()} to PNG for variable "${element.variableName}"`);
                        const convertedBuffer = await sharp(imageBytes).png().toBuffer();
                        pdfImage = await pdfDoc.embedPng(convertedBuffer);
                        this.logger.log(`[PDF-GENERATOR] ✅ Successfully converted and embedded ${imageFormat.toUpperCase()} as PNG`);
                    }
                    catch (conversionError) {
                        this.logger.warn(`[PDF-GENERATOR] ${imageFormat.toUpperCase()} conversion failed: ${conversionError.message}`);
                        failedImages++;
                        imageErrors.push(`Variable "${element.variableName}": conversion failed (${imageFormat})`);
                        continue;
                    }
                }
                else {
                    this.logger.error(`[PDF-GENERATOR] ❌ Unsupported image format: ${imageFormat}`);
                    failedImages++;
                    imageErrors.push(`Variable "${element.variableName}": unsupported format (${imageFormat})`);
                    continue;
                }
                page.drawImage(pdfImage, {
                    x,
                    y: y - height,
                    width,
                    height,
                });
                this.logger.log(`[PDF-GENERATOR] ✅ Image element rendered successfully for variable "${element.variableName}" at (${x}, ${y})`);
                processedImages++;
            }
            catch (error) {
                const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
                this.logger.error(`[PDF-GENERATOR] ❌ Failed to process image for variable "${element.variableName}": ${errorMessage}`, error.stack);
                failedImages++;
                imageErrors.push(`Variable "${element.variableName}": processing error (${errorMessage})`);
            }
        }
        this.logger.log(`[PDF-GENERATOR] 📊 Image processing summary: ${processedImages} succeeded, ${failedImages} failed`);
        if (imageErrors.length > 0) {
            this.logger.warn(`[PDF-GENERATOR] ❌ Image processing errors:`, imageErrors);
        }
    }
    async convertPdfToImages(pdfPath) {
        try {
            const pdfBytes = fs.readFileSync(pdfPath);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBytes);
            const pages = pdfDoc.getPages();
            if (pages.length === 0) {
                throw new common_1.BadRequestException('PDF has no pages');
            }
            const firstPage = pages[0];
            const { width: pdfWidth, height: pdfHeight } = firstPage.getSize();
            const maxPreviewWidth = 1200;
            const maxPreviewHeight = 900;
            const widthRatio = maxPreviewWidth / pdfWidth;
            const heightRatio = maxPreviewHeight / pdfHeight;
            const scaleFactor = Math.min(widthRatio, heightRatio);
            const previewWidth = Math.round(pdfWidth * scaleFactor);
            const previewHeight = Math.round(pdfHeight * scaleFactor);
            this.logger.log(`PDF dimensions: ${pdfWidth}x${pdfHeight}, Preview dimensions: ${previewWidth}x${previewHeight}`);
            const convert = pdf2pic.fromPath(pdfPath, {
                density: 200,
                saveFilename: `preview-${Date.now()}`,
                savePath: this.previewsDir,
                format: 'png',
                width: previewWidth,
                height: previewHeight,
            });
            const results = await convert.bulk(-1);
            const imageUrls = [];
            for (const result of results) {
                if (result.path) {
                    const filename = path.basename(result.path);
                    imageUrls.push(`/uploads/previews/${filename}`);
                }
            }
            this.logger.log(`Converted PDF to ${imageUrls.length} images`);
            return imageUrls;
        }
        catch (error) {
            this.logger.error(`Failed to convert PDF to images: ${error.message}`);
            throw new common_1.BadRequestException('Failed to generate preview images');
        }
    }
    async cartoonifyImage(imagePath) {
        try {
            this.logger.log(`Cartoonifying image: ${imagePath}`);
            await new Promise(resolve => setTimeout(resolve, 100));
            return `temp-images/${imagePath}`;
        }
        catch (error) {
            this.logger.error(`Cartoonification failed: ${error.message}`);
            throw error;
        }
    }
    validatePngBuffer(buffer) {
        try {
            const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
            if (buffer.length < 8) {
                this.logger.warn(`[PDF-GENERATOR] PNG validation failed: buffer too small (${buffer.length} bytes)`);
                return false;
            }
            for (let i = 0; i < 8; i++) {
                if (buffer[i] !== pngSignature[i]) {
                    this.logger.warn(`[PDF-GENERATOR] PNG validation failed: invalid signature at byte ${i}`);
                    return false;
                }
            }
            this.logger.log(`[PDF-GENERATOR] PNG signature validation passed`);
            return true;
        }
        catch (error) {
            this.logger.error(`[PDF-GENERATOR] PNG validation error: ${error.message}`);
            return false;
        }
    }
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            red: parseInt(result[1], 16) / 255,
            green: parseInt(result[2], 16) / 255,
            blue: parseInt(result[3], 16) / 255,
            type: 'RGB',
        } : { red: 0, green: 0, blue: 0, type: 'RGB' };
    }
};
exports.PdfGeneratorService = PdfGeneratorService;
exports.PdfGeneratorService = PdfGeneratorService = PdfGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [editor_elements_service_1.EditorElementsService,
        image_mapping_service_1.ImageMappingService])
], PdfGeneratorService);
//# sourceMappingURL=pdf-generator.service.js.map