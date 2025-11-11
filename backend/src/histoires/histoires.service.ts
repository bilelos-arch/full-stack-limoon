//backend/src/histoires/histoires.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Histoire, HistoireDocument } from './schemas/histoire.schema';
import { PdfGeneratorService } from './utils/pdf-generator.service';
import { TemplatesService } from '../templates.service';
import { UsersService } from '../users.service';
import { EditorElementsService } from '../editor-elements.service';
import { detectVariables } from '../utils/variables';
import { CreateHistoireDto } from './dto/create-histoire.dto';
import { UpdateHistoireDto } from './dto/update-histoire.dto';
import { PreviewHistoireDto } from './dto/preview-histoire.dto';
import { GenerateHistoireDto } from './dto/generate-histoire.dto';

@Injectable()
export class HistoiresService {
  private readonly logger = new Logger(HistoiresService.name);

  constructor(
    @InjectModel(Histoire.name) private histoireModel: Model<HistoireDocument>,
    private pdfGeneratorService: PdfGeneratorService,
    private templatesService: TemplatesService,
    private usersService: UsersService,
    private editorElementsService: EditorElementsService,
  ) {}

  async findByTemplate(templateId: string): Promise<HistoireDocument[]> {
    if (!Types.ObjectId.isValid(templateId)) {
      throw new BadRequestException('Invalid template ID');
    }

    return this.histoireModel
      .find({ templateId })
      .populate('templateId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(userId: string, createHistoireDto: CreateHistoireDto): Promise<HistoireDocument> {
    this.logger.log(`Creating histoire for user ${userId} with template ${createHistoireDto.templateId}`);

    const { templateId, variables } = createHistoireDto;

    // Validate template exists
    try {
      await this.templatesService.findOne(templateId);
    } catch (error) {
      this.logger.error(`Template ${templateId} not found: ${error.message}`);
      throw new BadRequestException('Template not found');
    }

    // Validate user exists
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      this.logger.error(`User ${userId} not found: ${error.message}`);
      throw new BadRequestException('User not found');
    }

    // Validate variables
    if (!variables || typeof variables !== 'object') {
      throw new BadRequestException('Variables must be a valid object');
    }

    // TODO: Validate variables against template requirements using editor elements

    const histoire = new this.histoireModel({
      templateId: new Types.ObjectId(templateId),
      userId: new Types.ObjectId(userId),
      variables,
    });

    const savedHistoire = await histoire.save();
    this.logger.log(`Histoire created successfully with ID: ${savedHistoire._id}`);
    return savedHistoire;
  }

  async generatePreview(userId: string, previewDto: PreviewHistoireDto, uploadedImageUrls?: string[]): Promise<{ previewUrls: string[], pdfUrl: string, histoireId: string }> {
    this.logger.log(`[SERVICE] Generating preview for user ${userId} with template ${previewDto.templateId}`);
    this.logger.log(`[SERVICE] Preview DTO:`, JSON.stringify(previewDto, null, 2));
    this.logger.log(`[SERVICE] Uploaded image URLs:`, uploadedImageUrls);

    const { templateId, variables } = previewDto;

    // Validate variables before generation (no default values for images)
    const validation = await this.pdfGeneratorService.validateVariables(await this.templatesService.findOne(templateId), variables, uploadedImageUrls);
    if (!validation.valid) {
      const errors = [];
      if (validation.missingVariables?.length) errors.push(`Missing variables: ${validation.missingVariables.join(', ')}`);
      if (validation.missingImages?.length) errors.push(`Missing images: ${validation.missingImages.join(', ')}`);
      if (validation.imageErrors?.length) errors.push(`Image errors: ${validation.imageErrors.join(', ')}`);
      throw new BadRequestException(`Validation failed: ${errors.join('; ')}`);
    }

    const mergedVariables = variables;

    // Validate template exists
    let template;
    try {
      template = await this.templatesService.findOne(templateId);
    } catch (error) {
      this.logger.error(`Template ${templateId} not found: ${error.message}`);
      throw new BadRequestException('Template not found');
    }

    // Validate user exists
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      this.logger.error(`User ${userId} not found: ${error.message}`);
      throw new BadRequestException('User not found');
    }

    // Generate preview images (now includes uploadedImageUrls)
    const previewUrls = await this.pdfGeneratorService.generatePreview(template, mergedVariables, uploadedImageUrls);
    this.logger.log(`[SERVICE] Preview generated successfully: ${previewUrls.length} images`);
    this.logger.log(`[SERVICE] Preview URLs:`, previewUrls);

    // Generate PDF with same variables (no defaults)
    const pdfUrl = await this.pdfGeneratorService.generateFinalPdf(template, mergedVariables, uploadedImageUrls);
    this.logger.log(`[SERVICE] PDF preview generated successfully: ${pdfUrl}`);

    // Create histoire record with preview URLs and PDF URL
    const histoire = new this.histoireModel({
      templateId: new Types.ObjectId(templateId),
      userId: new Types.ObjectId(userId),
      variables: mergedVariables,
      previewUrls,
      pdfUrl,
    });

    const savedHistoire = await histoire.save();
    this.logger.log(`[SERVICE] Histoire with preview created successfully with ID: ${savedHistoire._id}`);
    this.logger.log(`[SERVICE] Saved histoire preview URLs:`, savedHistoire.previewUrls);
    this.logger.log(`[SERVICE] Saved histoire PDF URL:`, savedHistoire.pdfUrl);

    return { previewUrls, pdfUrl, histoireId: savedHistoire._id.toString() };
  }

  async generatePdf(userId: string, histoireId: string): Promise<HistoireDocument> {
    this.logger.log(`Generating final PDF for histoire ${histoireId} by user ${userId}`);

    // Find the histoire
    const histoire = await this.histoireModel.findOne({
      _id: histoireId,
      userId: new Types.ObjectId(userId),
    });

    if (!histoire) {
      this.logger.warn(`Histoire ${histoireId} not found or access denied for user ${userId}`);
      throw new NotFoundException('Histoire not found or access denied');
    }

    // Get template
    let template;
    try {
      template = await this.templatesService.findOne(histoire.templateId.toString());
    } catch (error) {
      this.logger.error(`Template ${histoire.templateId} not found: ${error.message}`);
      throw new BadRequestException('Template not found');
    }

    // Generate final PDF
    const pdfUrl = await this.pdfGeneratorService.generateFinalPdf(template, histoire.variables);

    // Update histoire with PDF URL
    histoire.pdfUrl = pdfUrl;
    histoire.generatedPdfUrl = pdfUrl; // Also set generatedPdfUrl for consistency
    const updatedHistoire = await histoire.save();
    this.logger.log(`Final PDF generated successfully for histoire ${histoireId}: ${pdfUrl}`);

    return updatedHistoire;
  }

  async findOne(id: string, userId?: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid histoire ID');
    }

    const query: any = { _id: id };
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const histoire = await this.histoireModel
      .findOne(query)
      .populate('templateId')
      .populate('userId', 'name email')
      .exec();

    if (!histoire) {
      throw new NotFoundException('Histoire not found');
    }

    const histoireObj = histoire.toObject();
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return {
      ...histoireObj,
      previewImage: histoireObj.previewUrls?.[0] || null,
      defaultPdfUrl: histoireObj.pdfUrl || `${baseUrl}/uploads/pdfs/${histoireObj.templateId}-default.pdf`,
    };
  }

  async findByUser(userId: string): Promise<HistoireDocument[]> {
    this.logger.log(`Finding histoires for user ${userId}`);

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.histoireModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('templateId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, userId: string, updateHistoireDto: UpdateHistoireDto): Promise<HistoireDocument> {
    this.logger.log(`Updating histoire ${id} for user ${userId}`);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid histoire ID');
    }

    // Find and check ownership
    const histoire = await this.histoireModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!histoire) {
      this.logger.warn(`Histoire ${id} not found or access denied for user ${userId}`);
      throw new NotFoundException('Histoire not found or access denied');
    }

    // Validate template if provided
    if (updateHistoireDto.templateId) {
      try {
        await this.templatesService.findOne(updateHistoireDto.templateId);
      } catch (error) {
        this.logger.error(`Template ${updateHistoireDto.templateId} not found: ${error.message}`);
        throw new BadRequestException('Template not found');
      }
    }

    // Update the histoire
    const updatedHistoire = await this.histoireModel
      .findByIdAndUpdate(id, updateHistoireDto, { new: true })
      .populate('templateId')
      .populate('userId', 'name email')
      .exec();

    if (!updatedHistoire) {
      throw new NotFoundException('Histoire not found');
    }

    this.logger.log(`Histoire ${id} updated successfully`);
    return updatedHistoire;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Deleting histoire ${id} for user ${userId}`);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid histoire ID');
    }

    // Find and check ownership
    const histoire = await this.histoireModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!histoire) {
      this.logger.warn(`Histoire ${id} not found or access denied for user ${userId}`);
      throw new NotFoundException('Histoire not found or access denied');
    }

    // Remove associated files if they exist
    if (histoire.previewUrls && histoire.previewUrls.length > 0) {
      const fs = require('fs');
      const path = require('path');
      for (const previewUrl of histoire.previewUrls) {
        // previewUrl should already be a relative path like '/uploads/previews/filename.png'
        const previewPath = path.join('.', previewUrl);
        if (fs.existsSync(previewPath)) {
          fs.unlinkSync(previewPath);
          this.logger.log(`Removed preview file: ${previewPath}`);
        }
      }
    }

    if (histoire.pdfUrl) {
      const fs = require('fs');
      const path = require('path');
      // pdfUrl should already be a relative path like '/uploads/pdfs/filename.pdf'
      const pdfPath = path.join('.', histoire.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        this.logger.log(`Removed PDF file: ${pdfPath}`);
      }
    }

    await this.histoireModel.findByIdAndDelete(id);
    this.logger.log(`Histoire ${id} deleted successfully`);
  }

  async generateHistoire(userId: string, generateDto: GenerateHistoireDto, uploadedImageUrls?: string[]): Promise<HistoireDocument> {
    this.logger.log(`[DEBUG] Starting generateHistoire for user ${userId} with template ${generateDto.templateId}`);
    this.logger.log(`[DEBUG] Raw generateDto: ${JSON.stringify(generateDto, null, 2)}`);
    this.logger.log(`[DEBUG] Uploaded image URLs: ${uploadedImageUrls ? uploadedImageUrls.join(', ') : 'none'}`);
    uploadedImageUrls = uploadedImageUrls || [];

    const { templateId, variables: rawVariables } = generateDto;
    this.logger.log(`[DEBUG] Extracted templateId: ${templateId}`);
    this.logger.log(`[DEBUG] Raw variables type: ${typeof rawVariables}, value: ${JSON.stringify(rawVariables)}`);

    // Parse variables if they are received as JSON string
    let variables;
    try {
      this.logger.log(`[DEBUG] Parsing variables...`);
      variables = typeof rawVariables === 'string' ? JSON.parse(rawVariables) : rawVariables;
      this.logger.log(`[DEBUG] Variables parsed successfully: ${JSON.stringify(variables)}`);
    } catch (error) {
      this.logger.error(`[DEBUG] Failed to parse variables JSON: ${error.message}`);
      this.logger.error(`[DEBUG] Raw variables that failed: ${rawVariables}`);
      throw new BadRequestException('Variables must be a valid JSON string or object');
    }

    // Validate template exists
    let template;
    try {
      this.logger.log(`[DEBUG] Validating template ${templateId} exists`);
      template = await this.templatesService.findOne(templateId);
      this.logger.log(`[DEBUG] Template ${templateId} found: ${template?.title || 'No title'}`);
      this.logger.log(`[DEBUG] Template object: ${JSON.stringify(template, null, 2)}`);
    } catch (error) {
      this.logger.error(`[DEBUG] Template ${templateId} not found: ${error.message}`);
      this.logger.error(`[DEBUG] Template validation error details:`, error);
      throw new BadRequestException('Template not found');
    }

    // Validate user exists
    try {
      this.logger.log(`[DEBUG] Validating user ${userId} exists`);
      const user = await this.usersService.findById(userId);
      if (!user) {
        this.logger.error(`[DEBUG] User ${userId} not found - returned null/undefined`);
        throw new NotFoundException('User not found');
      }
      this.logger.log(`[DEBUG] User ${userId} found: ${user.fullName || 'No name'}`);
      this.logger.log(`[DEBUG] User object: ${JSON.stringify(user, null, 2)}`);
    } catch (error) {
      this.logger.error(`[DEBUG] User ${userId} not found: ${error.message}`);
      this.logger.error(`[DEBUG] User validation error details:`, error);
      throw new BadRequestException('User not found');
    }

    // Validate variables
    this.logger.log('[DEBUG] Raw variables received:', variables);
    this.logger.log('[DEBUG] Variables type:', typeof variables);
    this.logger.log('[DEBUG] Variables constructor:', variables?.constructor?.name);
    this.logger.log('[DEBUG] Variables instanceof Object:', variables instanceof Object);
    this.logger.log('[DEBUG] Variables isArray:', Array.isArray(variables));
    this.logger.log('[DEBUG] Variables keys:', variables ? Object.keys(variables) : 'N/A');

    if (!variables || typeof variables !== 'object' || Array.isArray(variables)) {
      this.logger.error('[DEBUG] Variables validation failed: variables must be a valid object');
      this.logger.error('[DEBUG] Variables value:', variables);
      this.logger.error('[DEBUG] Variables type:', typeof variables);
      this.logger.error('[DEBUG] Variables is null/undefined:', variables == null);
      this.logger.error('[DEBUG] Variables is empty object:', variables && Object.keys(variables).length === 0);
      throw new BadRequestException('Variables must be a valid object');
    }

    this.logger.log('[DEBUG] Variables received:', JSON.stringify(variables, null, 2));

    // Validate that all required variables from template are provided
    try {
      this.logger.log('[DEBUG] Validating required variables against template');
      this.logger.log('[DEBUG] Template for validation:', JSON.stringify(template, null, 2));
      this.logger.log('[DEBUG] Variables for validation:', JSON.stringify(variables, null, 2));
      const validation = await this.pdfGeneratorService.validateVariables(template, variables, uploadedImageUrls);
      this.logger.log('[DEBUG] Validation result:', validation);
      if (!validation.valid) {
        const errors = [];
        if (validation.missingVariables?.length) errors.push(`Missing variables: ${validation.missingVariables.join(', ')}`);
        if (validation.missingImages?.length) errors.push(`Missing images: ${validation.missingImages.join(', ')}`);
        if (validation.imageErrors?.length) errors.push(`Image errors: ${validation.imageErrors.join(', ')}`);
        this.logger.error('[DEBUG] Variable validation failed:', errors.join('; '));
        throw new BadRequestException(`Validation failed: ${errors.join('; ')}`);
      }
      this.logger.log('[DEBUG] Variable validation passed');
    } catch (error) {
      this.logger.error(`[DEBUG] Variable validation error: ${error.message}`);
      this.logger.error(`[DEBUG] Validation error stack:`, error.stack);
      throw error;
    }

    // Generate preview images first
    let previewUrls: string[] = [];
    try {
      this.logger.log('[DEBUG] Generating preview images');
      this.logger.log('[DEBUG] Template for preview:', template._id || template.id);
      this.logger.log('[DEBUG] Variables for preview:', JSON.stringify(variables, null, 2));
      previewUrls = await this.pdfGeneratorService.generatePreview(template, variables);
      this.logger.log(`[DEBUG] Preview images generated: ${previewUrls.length} images`);
      this.logger.log(`[DEBUG] Preview URLs: ${JSON.stringify(previewUrls)}`);
    } catch (error) {
      this.logger.error(`[DEBUG] Preview generation failed: ${error.message}`);
      this.logger.error(`[DEBUG] Preview generation error stack:`, error.stack);
      throw new BadRequestException('Failed to generate preview images');
    }

    // Generate final PDF
    let pdfUrl: string;
    try {
      this.logger.log('[DEBUG] Generating final PDF');
      this.logger.log('[DEBUG] Template for PDF:', template._id || template.id);
      this.logger.log('[DEBUG] Variables for PDF:', JSON.stringify(variables, null, 2));
      this.logger.log('[DEBUG] Uploaded image URLs for PDF:', uploadedImageUrls);
      pdfUrl = await this.pdfGeneratorService.generateFinalPdf(template, variables, uploadedImageUrls);
      this.logger.log(`[DEBUG] Final PDF generated: ${pdfUrl}`);
    } catch (error) {
      this.logger.error(`[DEBUG] PDF generation failed: ${error.message}`);
      this.logger.error(`[DEBUG] PDF generation error stack:`, error.stack);
      throw new BadRequestException('Failed to generate PDF');
    }

    // Create new Histoire record
    try {
      this.logger.log('[DEBUG] Creating Histoire record in database');
      this.logger.log('[DEBUG] Histoire data to save:', {
        templateId: templateId,
        userId: userId,
        variables: JSON.stringify(variables, null, 2),
        previewUrls: previewUrls,
        pdfUrl: pdfUrl,
        previewUrlsCount: previewUrls.length
      });

      const histoire = new this.histoireModel({
        templateId: new Types.ObjectId(templateId),
        userId: new Types.ObjectId(userId),
        variables,
        previewUrls,
        pdfUrl,
        generatedPdfUrl: pdfUrl, // Also set generatedPdfUrl for consistency
      });

      this.logger.log('[DEBUG] Histoire model created, attempting to save...');
      const savedHistoire = await histoire.save();
      this.logger.log(`[DEBUG] Histoire generated and saved successfully with ID: ${savedHistoire._id}, PDF: ${pdfUrl}, Previews: ${previewUrls.length}`);
      this.logger.log(`[DEBUG] Saved histoire object:`, JSON.stringify(savedHistoire, null, 2));

      return savedHistoire;
    } catch (error) {
      this.logger.error(`[DEBUG] Database save failed: ${error.message}`);
      this.logger.error(`[DEBUG] Database save error stack:`, error.stack);
      this.logger.error(`[DEBUG] Histoire data that failed to save:`, {
        templateId: templateId,
        userId: userId,
        variables: variables,
        previewUrls: previewUrls,
        pdfUrl: pdfUrl
      });
      throw new BadRequestException('Failed to save histoire to database');
    }
  }
}