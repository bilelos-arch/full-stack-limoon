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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images_photo', maxCount: 1 },
    { name: 'images_image', maxCount: 1 },
    { name: 'images_picture', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: './uploads/temp-images',
      filename: (req, file, callback) => {
        const variableName = file.fieldname.replace('images_', '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${variableName}-${uniqueSuffix}${extname(file.originalname)}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async generatePreview(@Body() body: any, @UploadedFiles() files: Record<string, Express.Multer.File[]>, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`[DEBUG] Generating preview for user ${userId}`);

    // Extract uploaded image paths and map them to variable names
    const uploadedImagePaths: string[] = [];
    const imageVariableMapping: Record<string, string> = {};

    if (files) {
      this.logger.log(`[DEBUG] Processing ${Object.keys(files).length} file fields for preview`);
      Object.entries(files).forEach(([fieldName, fileArray]) => {
        if (fieldName.startsWith('images_') && fileArray && fileArray.length > 0) {
          const variableName = fieldName.replace('images_', '');
          const file = fileArray[0];
          uploadedImagePaths.push(file.path);
          imageVariableMapping[variableName] = file.filename;
          this.logger.log(`[DEBUG] Mapped preview image variable "${variableName}" to file "${file.filename}" at path "${file.path}"`);
        }
      });
    }

    // Parse variables from form data
    let variables;
    try {
      variables = typeof body.variables === 'string' ? JSON.parse(body.variables) : body.variables;
    } catch (error) {
      this.logger.error(`[DEBUG] Failed to parse variables for preview: ${error.message}`);
      throw new BadRequestException('Variables must be a valid JSON string');
    }

    // Add image filenames to variables for preview generation
    Object.entries(imageVariableMapping).forEach(([variableName, filename]) => {
      variables[variableName] = filename;
      this.logger.log(`[DEBUG] Added preview image variable "${variableName}" with filename "${filename}"`);
    });

    const previewDto: PreviewHistoireDto = {
      templateId: body.templateId,
      variables,
    };

    const result = await this.histoiresService.generatePreview(userId, previewDto, uploadedImagePaths);
    return {
      previewUrls: result.previewUrls,
      pdfUrl: result.pdfUrl,
      histoireId: result.histoireId
    };
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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images_photo', maxCount: 1 },
    { name: 'images_image', maxCount: 1 },
    { name: 'images_picture', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: './uploads/temp-images',
      filename: (req, file, callback) => {
        // Extract variable name from field name (e.g., 'images_photo' -> 'photo')
        const variableName = file.fieldname.replace('images_', '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${variableName}-${uniqueSuffix}${extname(file.originalname)}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async generateHistoire(
    @Body() body: any,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Request() req,
  ) {
    const userId = req.user.userId;
    this.logger.log(`[DEBUG] Generating complete PDF for template ${body.templateId} by user ${userId}`);
    this.logger.log(`[DEBUG] Raw request body:`, body);
    this.logger.log(`[DEBUG] Uploaded files:`, files ? Object.keys(files) : 'none');

    // Extract uploaded image paths and map them to variable names
    const uploadedImagePaths: string[] = [];
    const imageVariableMapping: Record<string, string> = {};

    if (files) {
      this.logger.log(`[DEBUG] Processing ${Object.keys(files).length} file fields`);
      Object.entries(files).forEach(([fieldName, fileArray]) => {
        this.logger.log(`[DEBUG] Processing field "${fieldName}" with ${fileArray?.length || 0} files`);
        if (fieldName.startsWith('images_') && fileArray && fileArray.length > 0) {
          const variableName = fieldName.replace('images_', '');
          const file = fileArray[0]; // Take first file if multiple
          this.logger.log(`[DEBUG] File details: originalname=${file.originalname}, filename=${file.filename}, path=${file.path}, size=${file.size}`);
          uploadedImagePaths.push(file.path);
          imageVariableMapping[variableName] = file.filename;
          this.logger.log(`[DEBUG] Mapped image variable "${variableName}" to file "${file.filename}" at path "${file.path}"`);
        } else {
          this.logger.log(`[DEBUG] Skipping field "${fieldName}" - doesn't match image pattern or no files`);
        }
      });
    } else {
      this.logger.log(`[DEBUG] No files uploaded`);
    }

    this.logger.log(`[DEBUG] Final uploaded image paths:`, uploadedImagePaths);
    this.logger.log(`[DEBUG] Image variable mapping:`, imageVariableMapping);

    // Parse variables from form data
    let variables;
    try {
      this.logger.log(`[DEBUG] Parsing variables from body.variables:`, body.variables);
      variables = typeof body.variables === 'string' ? JSON.parse(body.variables) : body.variables;
      this.logger.log(`[DEBUG] Parsed variables:`, variables);
    } catch (error) {
      this.logger.error(`[DEBUG] Failed to parse variables: ${error.message}`);
      throw new BadRequestException('Variables must be a valid JSON string');
    }

    // Add image filenames to variables for PDF generation
    this.logger.log(`[DEBUG] Adding image filenames to variables...`);
    Object.entries(imageVariableMapping).forEach(([variableName, filename]) => {
      variables[variableName] = filename;
      this.logger.log(`[DEBUG] Added image variable "${variableName}" with filename "${filename}" to variables`);
    });

    this.logger.log(`[DEBUG] Final variables object:`, variables);

    const generateDto: GenerateHistoireDto = {
      templateId: body.templateId,
      variables,
    };

    this.logger.log(`[DEBUG] Calling histoiresService.generateHistoire with:`, {
      userId,
      templateId: generateDto.templateId,
      variablesCount: Object.keys(generateDto.variables).length,
      uploadedImagePathsCount: uploadedImagePaths.length
    });

    try {
      const result = await this.histoiresService.generateHistoire(userId, generateDto, uploadedImagePaths);
      this.logger.log(`[DEBUG] Histoire generation successful for user ${userId}, histoire ID: ${result._id}`);
      return result;
    } catch (error) {
      this.logger.error(`[DEBUG] Histoire generation failed for user ${userId}: ${error.message}`, error.stack);
      throw error; // Re-throw to let NestJS handle the error response
    }
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