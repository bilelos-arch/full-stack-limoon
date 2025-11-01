//backend/src/histoires/histoires.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { HistoiresService } from './histoires.service';
import { TemplatesService } from '../templates.service';
import { CreateHistoireDto } from './dto/create-histoire.dto';
import { UpdateHistoireDto } from './dto/update-histoire.dto';
import { PreviewHistoireDto } from './dto/preview-histoire.dto';
import { GenerateHistoireDto } from './dto/generate-histoire.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('histoires')
export class HistoiresController {
  private readonly logger = new Logger(HistoiresController.name);

  constructor(
    private readonly histoiresService: HistoiresService,
    private readonly templatesService: TemplatesService,
  ) {}

  @Get('template/:templateId')
  @UseGuards(JwtAuthGuard)
  async findByTemplate(@Param('templateId') templateId: string) {
    this.logger.log(`Finding histoires for template ${templateId}`);
    return this.histoiresService.findByTemplate(templateId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findByUser(@Request() req) {
    const userId = req.user.userId;
    this.logger.log(`Finding histoires for user ${userId}`);
    return this.histoiresService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`Finding histoire ${id} for user ${userId}`);
    return this.histoiresService.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createHistoireDto: CreateHistoireDto, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`Creating histoire for user ${userId}`);
    return this.histoiresService.create(userId, createHistoireDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateHistoireDto: UpdateHistoireDto, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`Updating histoire ${id} for user ${userId}`);
    return this.histoiresService.update(id, userId, updateHistoireDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`Deleting histoire ${id} for user ${userId}`);
    await this.histoiresService.remove(id, userId);
    return { message: 'Histoire deleted successfully' };
  }

  @Post('preview')
  @UseGuards(JwtAuthGuard)
  async generatePreview(@Body() previewDto: PreviewHistoireDto, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`Generating preview for user ${userId}`);
    return this.histoiresService.generatePreview(userId, previewDto);
  }

  @Post(':id/generer')
  @UseGuards(JwtAuthGuard)
  async generatePdf(@Param('id') histoireId: string, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`Generating final PDF for histoire ${histoireId} by user ${userId}`);
    return this.histoiresService.generatePdf(userId, histoireId);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 }, // Allow up to 10 images
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = 'user-image-' + uniqueSuffix + extname(file.originalname);
            callback(null, filename);
          },
        }),
        fileFilter: (req, file, callback) => {
          if (!file.mimetype.startsWith('image/')) {
            return callback(new BadRequestException('Only image files are allowed'), false);
          }
          callback(null, true);
        },
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB per image
        },
      },
    ),
  )
  async generateHistoire(
    @Body() generateDto: GenerateHistoireDto,
    @Request() req,
    @UploadedFiles() files?: { images?: Express.Multer.File[] },
  ) {
    const userId = req.user.userId;
    this.logger.log(`Generating complete PDF for template ${generateDto.templateId} by user ${userId}`);

    // Handle uploaded images
    let uploadedImagePaths: string[] = [];
    if (files?.images) {
      uploadedImagePaths = files.images.map(file => file.filename);
      this.logger.log(`Uploaded images: ${uploadedImagePaths.join(', ')}`);
    }

    return this.histoiresService.generateHistoire(userId, generateDto, uploadedImagePaths);
  }

  @Get('template/:id')
  @UseGuards(JwtAuthGuard)
  async getTemplateVariables(@Param('id') templateId: string) {
    this.logger.log(`Getting variables for template ${templateId}`);
    const template = await this.templatesService.findOne(templateId);
    const defaultValues = {
      nom: 'Alex',
      âge: '5',
      date: '2025-10-30',
      image: '/assets/avatar.png',
    };
    return {
      variables: template.variables,
      defaultValues,
    };
  }
}