import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage, PDFImage } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { Template, TemplateDocument } from '../../template.schema';
import { EditorElement } from '../../editor-element.schema';
import { EditorElementsService } from '../../editor-elements.service';
import { detectVariables } from '../../utils/variables';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private uploadsDir = './uploads';
  private cartoonifyServiceUrl = process.env.CARTOONIFY_SERVICE_URL || 'http://localhost:3001';

  constructor(private editorElementsService: EditorElementsService) {}

  async generatePreview(template: TemplateDocument, variables: Record<string, any>): Promise<string> {
    try {
      this.logger.log(`Generating preview for template ${template._id}`);

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
      await this.applyVariablesToPdf(pdfDoc, editorElements, variables, template);

      // Convert first page to image for preview
      const previewImagePath = await this.convertPdfToImage(pdfDoc, 'preview');

      this.logger.log(`Preview generated successfully: ${previewImagePath}`);
      return previewImagePath;
    } catch (error) {
      this.logger.error('Preview generation error:', error);
      throw new BadRequestException('Failed to generate preview');
    }
  }

  async generateFinalPdf(template: TemplateDocument, variables: Record<string, any>): Promise<string> {
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
      await this.applyVariablesToPdf(pdfDoc, editorElements, variables, template);

      const finalBytes = await pdfDoc.save();
      const finalFilename = `generated-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
      const finalPath = path.join(this.uploadsDir, finalFilename);

      fs.writeFileSync(finalPath, finalBytes);

      this.logger.log(`Final PDF generated successfully: ${finalFilename}`);
      return finalFilename;
    } catch (error) {
      this.logger.error('PDF generation error:', error);
      throw new BadRequestException('Failed to generate PDF');
    }
  }

  // Helper method to validate variables against template requirements
  validateVariables(template: TemplateDocument, variables: Record<string, any>): boolean {
    // Extract variables from template PDF content
    // This is a placeholder - in real implementation, you'd scan the PDF or use editor elements
    const requiredVars = detectVariables('Sample text with (name) and (age) variables');

    for (const varName of requiredVars) {
      if (!(varName in variables)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply variables to PDF using editor elements for positioning
   */
  private async applyVariablesToPdf(
    pdfDoc: PDFDocument,
    editorElements: EditorElement[],
    variables: Record<string, any>,
    template: TemplateDocument
  ): Promise<void> {
    this.logger.log(`Applying ${Object.keys(variables).length} variables to PDF with ${editorElements.length} elements`);

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
      await this.replaceTextVariables(page, textElements, variables, template);

      // Process image elements
      const imageElements = elements.filter(el => el.type === 'image');
      await this.replaceImageVariables(page, imageElements, variables, template, pdfDoc);
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
   * Replace image variables in PDF using editor elements
   */
  private async replaceImageVariables(
    page: PDFPage,
    imageElements: EditorElement[],
    variables: Record<string, any>,
    template: TemplateDocument,
    pdfDoc: PDFDocument
  ): Promise<void> {
    this.logger.log(`Processing ${imageElements.length} image elements`);

    for (const element of imageElements) {
      if (!element.variableName) {
        continue;
      }

      const imageVar = variables[element.variableName];
      if (!imageVar) {
        this.logger.warn(`No value found for image variable: ${element.variableName}`);
        continue;
      }

      let imagePath: string;
      if (typeof imageVar === 'string' && imageVar.startsWith('cartoon-')) {
        // Already cartoonified image
        imagePath = path.join(this.uploadsDir, imageVar);
      } else if (typeof imageVar === 'string') {
        // Original image that needs cartoonification
        try {
          const cartoonifiedPath = await this.cartoonifyImage(imageVar);
          imagePath = path.join(this.uploadsDir, cartoonifiedPath);
        } catch (error) {
          this.logger.error(`Failed to cartoonify image ${imageVar}: ${error.message}`);
          continue;
        }
      } else {
        this.logger.warn(`Invalid image variable type for ${element.variableName}`);
        continue;
      }

      if (!fs.existsSync(imagePath)) {
        this.logger.warn(`Image file not found: ${imagePath}`);
        continue;
      }

      // Calculate absolute positions
      const pageWidth = template.dimensions?.width || 595;
      const pageHeight = template.dimensions?.height || 842;

      const x = (element.x / 100) * pageWidth;
      const y = pageHeight - ((element.y / 100) * pageHeight);
      const width = (element.width / 100) * pageWidth;
      const height = (element.height / 100) * pageHeight;

      try {
        // Load and embed image
        const imageBytes = fs.readFileSync(imagePath);
        let pdfImage: PDFImage;

        if (imagePath.toLowerCase().endsWith('.png')) {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else if (imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg')) {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          this.logger.warn(`Unsupported image format: ${imagePath}`);
          continue;
        }

        // Draw image
        page.drawImage(pdfImage, {
          x,
          y: y - height, // PDF coordinates
          width,
          height,
        });

        this.logger.debug(`Image element rendered: ${imagePath} at (${x}, ${y})`);
      } catch (error) {
        this.logger.error(`Failed to embed image ${imagePath}: ${error.message}`);
      }
    }
  }

  /**
   * Convert PDF first page to image for preview
   */
  private async convertPdfToImage(pdfDoc: PDFDocument, prefix: string): Promise<string> {
    try {
      // For now, save as PDF and return path. In production, you'd use a library like pdf2pic
      // to convert to actual image format
      const imageFilename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
      const imagePath = path.join(this.uploadsDir, imageFilename);

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(imagePath, pdfBytes);

      this.logger.log(`Preview image saved: ${imageFilename}`);
      return imageFilename;
    } catch (error) {
      this.logger.error(`Failed to convert PDF to image: ${error.message}`);
      throw new BadRequestException('Failed to generate preview image');
    }
  }

  /**
   * Cartoonify an image using external service
   */
  private async cartoonifyImage(imagePath: string): Promise<string> {
    try {
      // TODO: Implement actual cartoonification API call
      // For now, return the original path as if it was cartoonified
      this.logger.log(`Cartoonifying image: ${imagePath}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // In production, this would call the cartoonify service and return the new path
      return `cartoon-${Date.now()}-${path.basename(imagePath)}`;
    } catch (error) {
      this.logger.error(`Cartoonification failed: ${error.message}`);
      throw error;
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