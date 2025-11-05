// backend/src/histoires/utils/pdf-generator.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage, PDFImage } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as pdf2pic from 'pdf2pic';
import * as sharp from 'sharp';
import { Template, TemplateDocument } from '../../template.schema';
import { EditorElement } from '../../editor-element.schema';
import { EditorElementsService } from '../../editor-elements.service';
import { ImageMappingService, ImageMappingResult } from './image-mapping.service';
import { detectVariables } from '../../utils/variables';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private uploadsDir = './uploads';
  private previewsDir = './uploads/previews';
  private cartoonifyServiceUrl = process.env.CARTOONIFY_SERVICE_URL || 'http://localhost:3001';

  constructor(
    private editorElementsService: EditorElementsService,
    private imageMappingService: ImageMappingService
  ) {}

  async generatePreview(template: TemplateDocument, variables: Record<string, any>, uploadedImagePaths?: string[]): Promise<string[]> {
    try {
      this.logger.log(`[PDF-GENERATOR] Generating preview for template ${template._id}`);
      this.logger.log(`[PDF-GENERATOR] Variables:`, JSON.stringify(variables, null, 2));
      this.logger.log(`[PDF-GENERATOR] Uploaded image paths:`, uploadedImagePaths);

      // Ensure previews directory exists
      if (!fs.existsSync(this.previewsDir)) {
        fs.mkdirSync(this.previewsDir, { recursive: true });
      }

      // Load the template PDF
      const templatePath = path.join(this.uploadsDir, template.pdfPath);
      if (!fs.existsSync(templatePath)) {
        throw new BadRequestException('Template PDF not found');
      }

      const templateBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);

      // Get editor elements for positioning
      const editorElements = await this.editorElementsService.findAllByTemplate(template._id.toString());

      // Apply variables to the PDF (now includes uploadedImagePaths for preview)
      await this.applyVariablesToPdf(pdfDoc, editorElements, variables, template, uploadedImagePaths);

      // Save modified PDF temporarily with traditional xref for compatibility
      const tempPdfFilename = `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
      const tempPdfPath = path.join(this.previewsDir, tempPdfFilename);
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      fs.writeFileSync(tempPdfPath, pdfBytes);

      // Convert PDF to images with improved error handling
      let previewImageUrls: string[] = [];
      try {
        previewImageUrls = await this.convertPdfToImages(tempPdfPath);
      } catch (error) {
        const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
        this.logger.error(`PDF to image conversion failed: ${errorMessage}`, error.stack || error);
        // Check if it's a binary missing error
        if (errorMessage.includes('GraphicsMagick') || errorMessage.includes('ImageMagick') || errorMessage.includes('spawn')) {
          this.logger.warn('Image conversion failed due to missing GraphicsMagick/ImageMagick binaries. This is expected in some environments.');
          previewImageUrls = [];
        } else {
          // Re-throw for unexpected errors
          throw new BadRequestException(`Failed to convert PDF to images: ${errorMessage}`);
        }
      }

      // Clean up temporary PDF
      fs.unlinkSync(tempPdfPath);

      this.logger.log(`[PDF-GENERATOR] Preview generated successfully: ${previewImageUrls.length} images`);
      this.logger.log(`[PDF-GENERATOR] Preview image URLs:`, previewImageUrls);
      return previewImageUrls;
    } catch (error) {
      const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
      this.logger.error(`Preview generation error: ${errorMessage}`, error.stack || error);
      throw new BadRequestException(`Failed to generate preview: ${errorMessage}`);
    }
  }

  async generateFinalPdf(template: TemplateDocument, variables: Record<string, any>, uploadedImagePaths?: string[]): Promise<string> {
    try {
      this.logger.log(`Generating final PDF for template ${template._id}`);

      // Load the template PDF
      const templatePath = path.join(this.uploadsDir, template.pdfPath);
      if (!fs.existsSync(templatePath)) {
        throw new BadRequestException('Template PDF not found');
      }

      const templateBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);

      // Get editor elements for positioning
      const editorElements = await this.editorElementsService.findAllByTemplate(template._id.toString());

      // Apply variables to the PDF
      await this.applyVariablesToPdf(pdfDoc, editorElements, variables, template, uploadedImagePaths);

      // Force traditional xref table for better PDF.js compatibility
      const finalBytes = await pdfDoc.save({ useObjectStreams: false });
      const finalFilename = `generated-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
      const finalPath = path.join(this.uploadsDir, finalFilename);

      fs.writeFileSync(finalPath, finalBytes);

      this.logger.log(`Final PDF generated successfully: ${finalFilename}`);
      return finalFilename;
    } catch (error) {
      const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
      this.logger.error(`PDF generation error: ${errorMessage}`, error.stack || error);
      throw new BadRequestException(`Failed to generate PDF: ${errorMessage}`);
    }
  }

  // Helper method to validate variables against template requirements (ENHANCED)
  async validateVariables(template: TemplateDocument, variables: Record<string, any>, uploadedImagePaths?: string[]): Promise<{
    valid: boolean;
    missingVariables?: string[];
    missingImages?: string[];
    imageErrors?: string[];
  }> {
    this.logger.log(`[VALIDATION] Starting comprehensive validation for template ${template._id}`);
    this.logger.log(`[VALIDATION] Variables provided:`, Object.keys(variables));
    this.logger.log(`[VALIDATION] Uploaded image paths:`, uploadedImagePaths);
    // Get editor elements for the template
    const editorElements = await this.editorElementsService.findAllByTemplate(template._id.toString());

    // Extract required variables from editor elements
    const requiredVars = new Set<string>();
    const imageVariables = new Set<string>();
    const textVariables = new Set<string>();

    for (const element of editorElements) {
      if (element.type === 'image') {
        if (element.variables && element.variables.length > 0) {
          element.variables.forEach(varName => imageVariables.add(varName));
        }
        if (element.variableName) {
          imageVariables.add(element.variableName);
        }
      } else if (element.type === 'text') {
        if (element.variables && element.variables.length > 0) {
          element.variables.forEach(varName => textVariables.add(varName));
        }
        if (element.variableName) {
          textVariables.add(element.variableName);
        }
      }

      // Also add to general required vars
      if (element.variables && element.variables.length > 0) {
        element.variables.forEach(varName => requiredVars.add(varName));
      }
      if (element.variableName) {
        requiredVars.add(element.variableName);
      }
    }

    this.logger.log(`[PDF-GENERATOR] Validation: ${requiredVars.size} total vars, ${imageVariables.size} image vars, ${textVariables.size} text vars`);

    const missingVariables: string[] = [];
    const missingImages: string[] = [];
    const imageErrors: string[] = [];

    // Check if all required variables are provided
    for (const varName of requiredVars) {
      if (!(varName in variables)) {
        missingVariables.push(varName);
        this.logger.warn(`[PDF-GENERATOR] Missing required variable: ${varName}`);
      }
    }

    // SPECIFIC VALIDATION FOR IMAGE VARIABLES
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

      // Validate image exists using the new service
      try {
        const mappingResult = await this.imageMappingService.findImageByVariable(
          imageVarName,
          imageVarValue,
          uploadedImagePaths
        );

        if (!mappingResult.found) {
          imageErrors.push(`Image not found for variable "${imageVarName}" with value "${imageVarValue}": ${mappingResult.error}`);
          this.logger.error(`[PDF-GENERATOR] Image validation failed for "${imageVarName}": ${mappingResult.error}`);
        } else {
          this.logger.log(`[PDF-GENERATOR] ✅ Image variable "${imageVarName}" validated successfully`);
        }
      } catch (error) {
        imageErrors.push(`Error validating image "${imageVarName}": ${error.message}`);
        this.logger.error(`[PDF-GENERATOR] Image validation error for "${imageVarName}": ${error.message}`, error.stack);
      }
    }

    const isValid = missingVariables.length === 0 && missingImages.length === 0 && imageErrors.length === 0;

    if (isValid) {
      this.logger.log(`[VALIDATION] ✅ All variables and images validated successfully`);
    } else {
      this.logger.error(`[VALIDATION] ❌ Validation failed: ${missingVariables.length} missing vars, ${missingImages.length} missing images, ${imageErrors.length} image errors`);
      if (missingVariables.length > 0) this.logger.error(`[VALIDATION] Missing variables: ${missingVariables.join(', ')}`);
      if (missingImages.length > 0) this.logger.error(`[VALIDATION] Missing images: ${missingImages.join(', ')}`);
      if (imageErrors.length > 0) this.logger.error(`[VALIDATION] Image errors: ${imageErrors.join(', ')}`);
    }

    return {
      valid: isValid,
      missingVariables: missingVariables.length > 0 ? missingVariables : undefined,
      missingImages: missingImages.length > 0 ? missingImages : undefined,
      imageErrors: imageErrors.length > 0 ? imageErrors : undefined,
    };
  }

  /**
   * Apply variables to PDF using editor elements for positioning
   */
  private async applyVariablesToPdf(
    pdfDoc: PDFDocument,
    editorElements: EditorElement[],
    variables: Record<string, any>,
    template: TemplateDocument,
    uploadedImagePaths?: string[]
  ): Promise<void> {
    this.logger.log(`Applying ${Object.keys(variables).length} variables to PDF with ${editorElements.length} elements`);

    // Collect default values from all elements
    const defaultVars: Record<string, any> = {};
    for (const element of editorElements) {
      if (element.defaultValues) {
        Object.assign(defaultVars, element.defaultValues);
      }
    }

    // Merge default values with user variables (user variables take precedence)
    const mergedVars = { ...defaultVars, ...variables };

    this.logger.log(`Merged variables: ${Object.keys(mergedVars).length} total (defaults: ${Object.keys(defaultVars).length}, user: ${Object.keys(variables).length})`);

    // Group elements by page
    const elementsByPage = editorElements.reduce((acc, element) => {
      if (!acc[element.pageIndex]) {
        acc[element.pageIndex] = [];
      }
      acc[element.pageIndex].push(element);
      return acc;
    }, {} as Record<number, EditorElement[]>);

    // Process each page
    for (const [pageIndexStr, elements] of Object.entries(elementsByPage)) {
      const pageIndex = parseInt(pageIndexStr);
      const pages = pdfDoc.getPages();

      if (pageIndex >= pages.length) {
        this.logger.warn(`Page index ${pageIndex} exceeds PDF page count ${pages.length}`);
        continue;
      }

      const page = pages[pageIndex];

      // Process text elements
      const textElements = elements.filter(el => el.type === 'text');
      await this.replaceTextVariables(page, textElements, mergedVars, template);

      // Process image elements
      const imageElements = elements.filter(el => el.type === 'image');
      await this.replaceImageVariables(page, imageElements, mergedVars, template, pdfDoc, uploadedImagePaths);
    }

    this.logger.log('Variables applied successfully to PDF');
  }

  /**
   * Replace text variables in PDF using editor elements
   */
  private async replaceTextVariables(
    page: PDFPage,
    textElements: EditorElement[],
    variables: Record<string, any>,
    template: TemplateDocument
  ): Promise<void> {
    this.logger.log(`Processing ${textElements.length} text elements`);

    for (const element of textElements) {
      if (!element.textContent || !element.variables?.length) {
        continue;
      }

      // Replace variables in text content
      let processedText = element.textContent;
      for (const varName of element.variables) {
        const varValue = variables[varName];
        if (varValue !== undefined) {
          const regex = new RegExp(`\\(${varName}\\)`, 'g');
          processedText = processedText.replace(regex, String(varValue));
        }
      }

      // Calculate absolute positions from relative coordinates
      const pageWidth = template.dimensions?.width || 595; // A4 width in points
      const pageHeight = template.dimensions?.height || 842; // A4 height in points

      const x = (element.x / 100) * pageWidth;
      const y = pageHeight - ((element.y / 100) * pageHeight); // PDF coordinates start from bottom-left
      const width = (element.width / 100) * pageWidth;
      const height = (element.height / 100) * pageHeight;

      // Load font
      let font: PDFFont;
      try {
        if (element.googleFont) {
          // For now, use standard font. In production, you'd load Google Fonts
          font = await page.doc.embedFont(StandardFonts.Helvetica);
        } else {
          font = await page.doc.embedFont(StandardFonts.Helvetica);
        }
      } catch (error) {
        this.logger.warn(`Failed to load font, using default: ${error.message}`);
        font = await page.doc.embedFont(StandardFonts.Helvetica);
      }

      // Calculate font size to fit the element
      const fontSize = element.fontSize || Math.min(height * 0.8, width / processedText.length * 2) || 12;

      // Draw text
      page.drawText(processedText, {
        x,
        y: y - fontSize, // Adjust for baseline
        size: fontSize,
        font,
        color: element.color ? rgb(
          parseInt(element.color.slice(1, 3), 16) / 255,
          parseInt(element.color.slice(3, 5), 16) / 255,
          parseInt(element.color.slice(5, 7), 16) / 255
        ) : rgb(0, 0, 0),
        maxWidth: width,
      });

      this.logger.debug(`Text element rendered: "${processedText}" at (${x}, ${y})`);
    }
  }

  /**
     * Replace image variables in PDF using editor elements (ROBUST VERSION WITH DATA URL SUPPORT)
     */
    private async replaceImageVariables(
      page: PDFPage,
      imageElements: EditorElement[],
      variables: Record<string, any>,
      template: TemplateDocument,
      pdfDoc: PDFDocument,
      uploadedImagePaths?: string[]
    ): Promise<void> {
      this.logger.log(`[PDF-GENERATOR] Processing ${imageElements.length} image elements with robust mapping`);
      this.logger.log(`[PDF-GENERATOR] Available variables:`, Object.keys(variables));
      this.logger.log(`[PDF-GENERATOR] Uploaded image paths:`, uploadedImagePaths);

      let processedImages = 0;
      let failedImages = 0;
      const imageErrors: string[] = [];

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
          let imageBytes: Buffer;
          let imageFormat: string;

          // DÉTECTION ET TRAITEMENT DES DATA URLs BASE64
          if (imageVar.startsWith('data:image/')) {
            this.logger.log(`[PDF-GENERATOR] 🔍 Detected data URL for variable "${element.variableName}"`);

            // Extraire les données de la data URL
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

            // Convertir base64 en buffer
            try {
              imageBytes = Buffer.from(base64Data, 'base64');
              this.logger.log(`[PDF-GENERATOR] ✅ Successfully decoded base64 data (${imageBytes.length} bytes)`);
            } catch (decodeError) {
              this.logger.error(`[PDF-GENERATOR] ❌ Failed to decode base64 data: ${decodeError.message}`);
              failedImages++;
              imageErrors.push(`Variable "${element.variableName}": base64 decode failed`);
              continue;
            }

            // VALIDATION PNG POUR LES DATA URLs
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

          } else {
            // TRAITEMENT CLASSIQUE DES CHEMINS D'IMAGES
            const mappingResult = await this.imageMappingService.findImageByVariable(
              element.variableName,
              imageVar,
              uploadedImagePaths
            );

            if (!mappingResult.found || !mappingResult.imagePath) {
              const errorMsg = mappingResult.error || `Image not found for variable "${element.variableName}"`;
              this.logger.error(`[PDF-GENERATOR] ❌ ${errorMsg}`);
              failedImages++;
              imageErrors.push(`Variable "${element.variableName}": ${errorMsg}`);
              continue;
            }

            let imagePath = mappingResult.imagePath;
            this.logger.log(`[PDF-GENERATOR] ✅ Found image path: ${imagePath} (filename: ${mappingResult.filename})`);

            // VALIDATION SYSTÉMATIQUE DU FICHIER
            const validation = this.imageMappingService.validateImageExists(imagePath);
            if (!validation.valid) {
              this.logger.error(`[PDF-GENERATOR] ❌ Image validation failed: ${validation.error}`);
              failedImages++;
              imageErrors.push(`Variable "${element.variableName}": ${validation.error}`);
              continue;
            }

            // Charger les bytes de l'image
            imageBytes = fs.readFileSync(imagePath);
            imageFormat = path.extname(imagePath).toLowerCase().replace('.', '');
            this.logger.log(`[PDF-GENERATOR] ✅ Loaded image from file: ${imageFormat} (${imageBytes.length} bytes)`);
          }

          // Calculate absolute positions
          const pageWidth = template.dimensions?.width || 595;
          const pageHeight = template.dimensions?.height || 842;

          const x = (element.x / 100) * pageWidth;
          const y = pageHeight - ((element.y / 100) * pageHeight);
          const width = (element.width / 100) * pageWidth;
          const height = (element.height / 100) * pageHeight;

          this.logger.log(`[PDF-GENERATOR] Calculated position: x=${x}, y=${y}, width=${width}, height=${height}`);

          // Embed image dans le PDF
          let pdfImage: PDFImage;

          // TRAITEMENT UNIFIÉ DES IMAGES (DATA URL OU FICHIER)
          if (imageFormat === 'png') {
            pdfImage = await pdfDoc.embedPng(imageBytes);
            this.logger.log(`[PDF-GENERATOR] ✅ Embedded PNG image`);
          } else if (imageFormat === 'jpg' || imageFormat === 'jpeg') {
            // Convertir JPG/JPEG en PNG si nécessaire
            try {
              this.logger.log(`[PDF-GENERATOR] 🔄 Converting JPG to PNG for variable "${element.variableName}"`);
              const convertedBuffer = await sharp(imageBytes).png().toBuffer();
              pdfImage = await pdfDoc.embedPng(convertedBuffer);
              this.logger.log(`[PDF-GENERATOR] ✅ Successfully converted and embedded JPG as PNG`);
            } catch (conversionError) {
              this.logger.warn(`[PDF-GENERATOR] JPG conversion failed, trying direct embedding: ${conversionError.message}`);
              pdfImage = await pdfDoc.embedJpg(imageBytes);
              this.logger.log(`[PDF-GENERATOR] ✅ Embedded JPG image (fallback)`);
            }
          } else if (imageFormat === 'gif' || imageFormat === 'webp') {
            // Convertir GIF/WEBP en PNG
            try {
              this.logger.log(`[PDF-GENERATOR] 🔄 Converting ${imageFormat.toUpperCase()} to PNG for variable "${element.variableName}"`);
              const convertedBuffer = await sharp(imageBytes).png().toBuffer();
              pdfImage = await pdfDoc.embedPng(convertedBuffer);
              this.logger.log(`[PDF-GENERATOR] ✅ Successfully converted and embedded ${imageFormat.toUpperCase()} as PNG`);
            } catch (conversionError) {
              this.logger.warn(`[PDF-GENERATOR] ${imageFormat.toUpperCase()} conversion failed: ${conversionError.message}`);
              failedImages++;
              imageErrors.push(`Variable "${element.variableName}": conversion failed (${imageFormat})`);
              continue;
            }
          } else {
            this.logger.error(`[PDF-GENERATOR] ❌ Unsupported image format: ${imageFormat}`);
            failedImages++;
            imageErrors.push(`Variable "${element.variableName}": unsupported format (${imageFormat})`);
            continue;
          }

          // Draw image
          page.drawImage(pdfImage, {
            x,
            y: y - height, // PDF coordinates
            width,
            height,
          });

          this.logger.log(`[PDF-GENERATOR] ✅ Image element rendered successfully for variable "${element.variableName}" at (${x}, ${y})`);
          processedImages++;

        } catch (error) {
          const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
          this.logger.error(`[PDF-GENERATOR] ❌ Failed to process image for variable "${element.variableName}": ${errorMessage}`, error.stack);
          failedImages++;
          imageErrors.push(`Variable "${element.variableName}": processing error (${errorMessage})`);
        }
      }

      // RAPPORT FINAL DE TRAITEMENT DES IMAGES
      this.logger.log(`[PDF-GENERATOR] 📊 Image processing summary: ${processedImages} succeeded, ${failedImages} failed`);
      if (imageErrors.length > 0) {
        this.logger.warn(`[PDF-GENERATOR] ❌ Image processing errors:`, imageErrors);
      }
    }

  /**
   * Convert PDF pages to images for preview
   */
  private async convertPdfToImages(pdfPath: string): Promise<string[]> {
    try {
      // Load PDF to get actual page dimensions
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      if (pages.length === 0) {
        throw new BadRequestException('PDF has no pages');
      }

      // Get the first page dimensions to calculate aspect ratio
      const firstPage = pages[0];
      const { width: pdfWidth, height: pdfHeight } = firstPage.getSize();

      // Calculate preview dimensions maintaining aspect ratio
      const maxPreviewWidth = 1200;
      const maxPreviewHeight = 900;

      // Calculate scaling factor to fit within max dimensions while preserving aspect ratio
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

      const results = await convert.bulk(-1); // Convert all pages
      const imageUrls: string[] = [];

      for (const result of results) {
        if (result.path) {
          // Return URL path for serving via /uploads
          const filename = path.basename(result.path);
          imageUrls.push(`/uploads/previews/${filename}`);
        }
      }

      this.logger.log(`Converted PDF to ${imageUrls.length} images`);
      return imageUrls;
    } catch (error) {
      this.logger.error(`Failed to convert PDF to images: ${error.message}`);
      throw new BadRequestException('Failed to generate preview images');
    }
  }

  /**
   * Cartoonify an image using external service
   */
  private async cartoonifyImage(imagePath: string): Promise<string> {
    try {
      // TODO: Implement actual cartoonification API call
      // For now, return the original path from temp-images directory
      this.logger.log(`Cartoonifying image: ${imagePath}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Return the path in temp-images directory (original uploaded image)
      return `temp-images/${imagePath}`;
    } catch (error) {
      this.logger.error(`Cartoonification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate PNG buffer data
   */
  private validatePngBuffer(buffer: Buffer): boolean {
    try {
      // Vérifier la signature PNG (premiers 8 bytes)
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
    } catch (error) {
      this.logger.error(`[PDF-GENERATOR] PNG validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { red: number; green: number; blue: number; type: 'RGB' } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      red: parseInt(result[1], 16) / 255,
      green: parseInt(result[2], 16) / 255,
      blue: parseInt(result[3], 16) / 255,
      type: 'RGB' as const,
    } : { red: 0, green: 0, blue: 0, type: 'RGB' as const };
  }
}