//backend/src/templates.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Template, TemplateDocument } from './template.schema';
import { CreateTemplateDto } from './create-template.dto';
import { UpdateTemplateDto } from './update-template.dto';
import { EditorElement } from './editor-element.schema';
import { parseVariablesFromEditorElements } from './utils/variables';
import { PdfGeneratorService } from './histoires/utils/pdf-generator.service';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.min.mjs';
import { PDFDocument } from 'pdf-lib';
// Configure PDF.js for Node.js
pdfjsLib.GlobalWorkerOptions.workerSrc = path.resolve(require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs'));

@Injectable()
export class TemplatesService {
  private tempPreviewsDir = './uploads/temp-previews';

  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
    @InjectModel(EditorElement.name) private editorElementModel: Model<EditorElement>,
    private pdfGeneratorService: PdfGeneratorService,
  ) {
    // Ensure temp previews directory exists
    if (!fs.existsSync(this.tempPreviewsDir)) {
      fs.mkdirSync(this.tempPreviewsDir, { recursive: true });
    }
  }

  async create(createTemplateDto: CreateTemplateDto, pdfPath: string, coverPath: string): Promise<TemplateDocument> {
    console.log('=== TEMPLATES SERVICE CREATE ===');
    console.log('DTO:', createTemplateDto);
    console.log('DTO.ageRange:', createTemplateDto.ageRange);
    console.log('Paths:', { pdfPath, coverPath });

    try {
      // Normalize category and language values
      const normalizedDto = {
        ...createTemplateDto,
        category: this.normalizeCategory(createTemplateDto.category),
        language: this.normalizeLanguage(createTemplateDto.language),
      } as CreateTemplateDto;

      // Analyze PDF
      console.log('Analyzing PDF...');
      const pdfMetadata = await this.analyzePdf(pdfPath);
      console.log('PDF metadata:', pdfMetadata);

      // Get editor elements for this template (though it might be empty at creation)
      const editorElements = await this.editorElementModel.find({ templateId: null }).exec(); // Will be empty initially
      const variables = parseVariablesFromEditorElements(editorElements);

      const templateData = {
        ...normalizedDto,
        pdfPath,
        coverPath,
        pageCount: pdfMetadata.pageCount,
        dimensions: pdfMetadata.dimensions,
        variables,
      };
      console.log('Template data to save:', templateData);
      console.log('Template data ageRange:', templateData.ageRange);

      const createdTemplate = new this.templateModel(templateData);
      console.log('Saving template...');

      const result = await createdTemplate.save();
      console.log('Template saved successfully:', result._id);
      return result;
    } catch (error) {
      console.error('ERROR in template creation:', error);
      // Clean up files if creation fails
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      throw error;
    }
  }

  async findAll(query: any = {}): Promise<TemplateDocument[]> {
    const filter: any = {};

    if (query.category) filter.category = query.category;
    if (query.gender) filter.gender = query.gender;
    if (query.ageRange) filter.ageRange = query.ageRange;
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished === 'true';
    if (query.language) filter.language = query.language;

    return this.templateModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<TemplateDocument> {
    console.log('findOne called with id:', id);
    console.log('id is valid ObjectId:', Types.ObjectId.isValid(id));
    if (!Types.ObjectId.isValid(id)) {
      console.log('Throwing BadRequestException for invalid ID');
      throw new BadRequestException('Invalid template ID');
    }
    const template = await this.templateModel.findById(id).exec();
    console.log('Template found:', !!template);
    if (!template) {
      console.log('Throwing NotFoundException for template not found');
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto, files?: { pdf?: Express.Multer.File[]; cover?: Express.Multer.File[] }): Promise<TemplateDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid template ID');
    }

    const updateData: any = { ...updateTemplateDto };

    // Handle file updates
    if (files?.pdf && files.pdf.length > 0) {
      const pdfPath = files.pdf[0].filename;
      updateData.pdfPath = pdfPath;

      // Re-analyze PDF for metadata
      const pdfMetadata = await this.analyzePdf(pdfPath);
      updateData.pageCount = pdfMetadata.pageCount;
      updateData.dimensions = pdfMetadata.dimensions;

      // Update variables from editor elements
      const editorElements = await this.editorElementModel.find({ templateId: id }).exec();
      updateData.variables = parseVariablesFromEditorElements(editorElements);
    }

    if (files?.cover && files.cover.length > 0) {
      updateData.coverPath = files.cover[0].filename;
    }

    const updatedTemplate = await this.templateModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedTemplate) {
      throw new NotFoundException('Template not found');
    }

    return updatedTemplate;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid template ID');
    }
    const template = await this.findOne(id);

    // Remove files
    if (fs.existsSync(template.pdfPath)) fs.unlinkSync(template.pdfPath);
    if (fs.existsSync(template.coverPath)) fs.unlinkSync(template.coverPath);

    await this.templateModel.findByIdAndDelete(id).exec();
  }

  async search(query: string, limit: number = 10): Promise<TemplateDocument[]> {
    if (!query.trim()) {
      return [];
    }

    const searchRegex = new RegExp(query, 'i');

    return this.templateModel
      .find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
        ],
        isPublished: true,
      })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async generatePreview(templateId: string, variables: Record<string, any>): Promise<{ pdfUrl: string }> {
    console.log('=== GENERATE PREVIEW DEBUG ===');
    console.log('Template ID:', templateId);
    console.log('Variables:', variables);

    // Find the template
    const template = await this.findOne(templateId);
    console.log('Template found:', template._id, template.title);

    // Check if template is published
    if (!template.isPublished) {
      throw new BadRequestException('Template is not available for preview');
    }

    // Generate temporary PDF
    console.log('Generating temporary PDF...');
    const tempPdfFilename = await this.pdfGeneratorService.generateFinalPdf(template, variables);
    console.log('Generated PDF filename:', tempPdfFilename);

    // Move to temp previews directory
    const tempPdfPath = path.join('.', tempPdfFilename);
    const finalTempPath = path.join(this.tempPreviewsDir, `preview-${templateId}-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`);

    console.log('Moving PDF from:', tempPdfPath, 'to:', finalTempPath);
    console.log('Temp PDF exists:', fs.existsSync(tempPdfPath));
    console.log('Temp previews dir exists:', fs.existsSync(this.tempPreviewsDir));

    fs.renameSync(tempPdfPath, finalTempPath);

    console.log('File moved successfully. Final path exists:', fs.existsSync(finalTempPath));

    // Schedule cleanup after 24 hours instead of 1 hour for better persistence
    setTimeout(() => {
      try {
        if (fs.existsSync(finalTempPath)) {
          fs.unlinkSync(finalTempPath);
        }
      } catch (error) {
        console.error('Failed to cleanup temp preview file:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Return URL for serving
    const filename = path.basename(finalTempPath);
    const pdfUrl = `/uploads/temp-previews/${filename}`;
    console.log('Returning PDF URL:', pdfUrl);
    console.log('Full URL should be:', `${process.env.BASE_URL || 'http://localhost:3000'}${pdfUrl}`);
    console.log('File exists at final path:', fs.existsSync(finalTempPath));
    console.log('File size:', fs.existsSync(finalTempPath) ? fs.statSync(finalTempPath).size : 'N/A');

    return {
      pdfUrl
    };
  }

  private normalizeCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'contes-et-aventures-imaginaires': 'Contes et aventures imaginaires',
      'heros-du-quotidien': 'Héros du quotidien',
      'histoires-avec-des-animaux': 'Histoires avec des animaux',
      'histoires-educatives': 'Histoires éducatives',
      'valeurs-et-developpement-personnel': 'Valeurs et développement personnel',
      'vie-quotidienne-et-ecole': 'Vie quotidienne et école',
      'fetes-et-occasions-speciales': 'Fêtes et occasions spéciales',
      'exploration-et-science-fiction': 'Exploration et science-fiction',
      'culture-et-traditions': 'Culture et traditions',
      'histoires-du-soir': 'Histoires du soir',
    };
    return categoryMap[category] || category;
  }

  private normalizeLanguage(language: string): string {
    const languageMap: { [key: string]: string } = {
      'français': 'Français',
      'anglais': 'Anglais',
      'arabe': 'Arabe',
    };
    return languageMap[language] || language;
  }

  private async analyzePdf(pdfPath: string): Promise<{ pageCount: number; dimensions: { width: number; height: number } }> {
    try {
      const fullPath = path.join('./uploads', pdfPath);
      console.log('Analyzing PDF at path:', pdfPath);
      console.log('Full path:', fullPath);
      console.log('File exists:', fs.existsSync(fullPath));
      console.log('File size:', fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 'N/A');

      const data = new Uint8Array(fs.readFileSync(fullPath));
      console.log('PDF data length:', data.length);

      const pdf = await pdfjsLib.getDocument({ data }).promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);

      const pageCount = pdf.numPages;

      // Get first page dimensions (dimensions réelles du PDF pour une conversion précise)
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      const dimensions = {
        width: viewport.width,
        height: viewport.height,
      };

      console.log('PDF analysis complete - Real PDF dimensions:', { pageCount, dimensions });
      return { pageCount, dimensions };
    } catch (error) {
      console.error('PDF analysis error details:', error);
      throw new BadRequestException('Invalid PDF file');
    }
  }

}