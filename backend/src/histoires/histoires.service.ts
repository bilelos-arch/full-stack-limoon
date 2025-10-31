import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Histoire, HistoireDocument } from './schemas/histoire.schema';
import { PdfGeneratorService } from './utils/pdf-generator.service';
import { TemplatesService } from '../templates.service';
import { UsersService } from '../users.service';
import { detectVariables } from '../utils/variables';
import { CreateHistoireDto } from './dto/create-histoire.dto';
import { UpdateHistoireDto } from './dto/update-histoire.dto';
import { PreviewHistoireDto } from './dto/preview-histoire.dto';

@Injectable()
export class HistoiresService {
  private readonly logger = new Logger(HistoiresService.name);

  constructor(
    @InjectModel(Histoire.name) private histoireModel: Model<HistoireDocument>,
    private pdfGeneratorService: PdfGeneratorService,
    private templatesService: TemplatesService,
    private usersService: UsersService,
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

  async generatePreview(userId: string, previewDto: PreviewHistoireDto): Promise<{ previewUrl: string }> {
    this.logger.log(`Generating preview for user ${userId} with template ${previewDto.templateId}`);

    const { templateId, variables } = previewDto;

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

    // Generate preview PDF
    const previewUrl = await this.pdfGeneratorService.generatePreview(template, variables);
    this.logger.log(`Preview generated successfully: ${previewUrl}`);

    return { previewUrl };
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
    const updatedHistoire = await histoire.save();
    this.logger.log(`Final PDF generated successfully for histoire ${histoireId}: ${pdfUrl}`);

    return updatedHistoire;
  }

  async findOne(id: string, userId?: string): Promise<HistoireDocument> {
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

    return histoire;
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
    if (histoire.previewUrl) {
      const fs = require('fs');
      const path = require('path');
      const previewPath = path.join('./uploads', histoire.previewUrl);
      if (fs.existsSync(previewPath)) {
        fs.unlinkSync(previewPath);
      }
    }

    if (histoire.pdfUrl) {
      const fs = require('fs');
      const path = require('path');
      const pdfPath = path.join('./uploads', histoire.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await this.histoireModel.findByIdAndDelete(id);
    this.logger.log(`Histoire ${id} deleted successfully`);
  }
}