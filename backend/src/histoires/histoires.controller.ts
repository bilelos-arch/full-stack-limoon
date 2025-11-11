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
import { extname, join } from 'path';
import { mkdirSync } from 'fs';

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
    // Flexible field configuration - accepte tous les champs d'images du formulaire
    // Configuration flexible pour accepter tous les champs d'images
    { name: 'images_photo', maxCount: 1 },
    { name: 'images_image', maxCount: 1 },
    { name: 'images_picture', maxCount: 1 },
    { name: 'images_portrait', maxCount: 1 },
    { name: 'images_avatar', maxCount: 1 },
    { name: 'images_personnage', maxCount: 1 },
    { name: 'images_scene', maxCount: 1 },
    { name: 'images_fond', maxCount: 1 },
    { name: 'images_objet', maxCount: 1 },
    { name: 'images_autre', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const uploadPath = join(process.cwd(), 'uploads', 'temp-images');
        try {
          mkdirSync(uploadPath, { recursive: true });
          callback(null, uploadPath);
        } catch (error) {
          callback(error, uploadPath);
        }
      },
      filename: (req, file, callback) => {
        const variableName = (file.fieldname || '').replace('images_', '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname);
        callback(null, `${variableName}-${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      const logger = req.res?.locals?.logger || new Logger('FileUpload');
      const fileType = file.mimetype || 'unknown';
      if (!fileType.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        const errorMsg = `Invalid file type: ${fileType}. Only image files (jpg, jpeg, png, gif, webp) are allowed!`;
        logger.error(`[CONTROLLER] File filter rejected: ${errorMsg}`);
        return callback(new BadRequestException(errorMsg || 'Invalid file type'), false);
      }
      const fileName = file.originalname || 'unknown';
      if (fileName && fileType) {
        logger.log(`[CONTROLLER] File filter accepted: ${fileName} (${fileType})`);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB par fichier
      files: 10, // Maximum 10 fichiers
    },
  }))
  async generatePreview(@Body() body: any, @UploadedFiles() files: Record<string, Express.Multer.File[]>, @Request() req) {
    const userId = req.user.userId;
    this.logger.log(`[CONTROLLER] 📸 Generating preview for user ${userId}`);
    this.logger.log(`[CONTROLLER] 📝 Request body:`, JSON.stringify(body, null, 2));
    this.logger.log(`[CONTROLLER] 📁 Uploaded files:`, Object.keys(files || {}));
    
    // Validation des paramètres requis
    if (!body.templateId) {
      throw new BadRequestException('Template ID is required');
    }
    
    if (!body.variables) {
      throw new BadRequestException('Variables object is required');
    }

    // Extract uploaded image paths and map them to variable names (local file paths)
    const uploadedImageUrls: string[] = [];
    const imageVariableMapping: Record<string, string> = {};
    const fileProcessingErrors: string[] = [];

    if (files && Object.keys(files).length > 0) {
      this.logger.log(`[CONTROLLER] Processing ${Object.keys(files).length} file fields for preview`);

      for (const [fieldName, fileArray] of Object.entries(files)) {
        try {
          if (fieldName.startsWith('images_') && fileArray && fileArray.length > 0) {
            const variableName = fieldName.replace('images_', '');
            const file = fileArray[0];

            // Validation du fichier uploadé (diskStorage fournit path comme chemin local)
            if (!file || !file.path) {
              const errorMsg = `Invalid file data for field "${fieldName}"`;
              this.logger.error(`[CONTROLLER] ${errorMsg}`);
              fileProcessingErrors.push(errorMsg);
              continue;
            }

            uploadedImageUrls.push(file.path); // Local file path
            imageVariableMapping[variableName] = file.path; // Store local file path

            this.logger.log(`[CONTROLLER] ✅ Mapped preview image variable "${variableName}" to local path "${file.path}"`);
          }
        } catch (error) {
          const errorMsg = `Error processing file field "${fieldName}": ${error.message}`;
          this.logger.error(`[CONTROLLER] ${errorMsg}`);
          fileProcessingErrors.push(errorMsg);
        }
      }
    } else {
      this.logger.log(`[CONTROLLER] No image files uploaded for preview`);
    }

    this.logger.log(`[CONTROLLER] 📊 File processing summary: ${uploadedImageUrls.length} files processed, ${fileProcessingErrors.length} errors`);

    // Parse variables from form data with enhanced error handling
    let variables;
    try {
      variables = typeof body.variables === 'string' ? JSON.parse(body.variables) : body.variables;
      
      if (!variables || typeof variables !== 'object') {
        throw new Error('Variables must be a valid object');
      }
      
      this.logger.log(`[CONTROLLER] ✅ Parsed ${Object.keys(variables).length} variables`);
    } catch (error) {
      const errorMsg = `Failed to parse variables: ${error.message}`;
      this.logger.error(`[CONTROLLER] ❌ ${errorMsg}`);
      throw new BadRequestException(`Variables must be a valid JSON object: ${error.message}`);
    }

    // Add image filenames to variables for preview generation (ENHANCED)
    const addedImageVars: string[] = [];
    Object.entries(imageVariableMapping).forEach(([variableName, filename]) => {
      variables[variableName] = filename;
      addedImageVars.push(variableName);
      this.logger.log(`[CONTROLLER] ✅ Added preview image variable "${variableName}" with filename "${filename}"`);
    });

    this.logger.log(`[CONTROLLER] 📸 Added ${addedImageVars.length} image variables to the variables object`);

    // Return processing summary for debugging
    const previewDto: PreviewHistoireDto = {
      templateId: body.templateId,
      variables,
    };

    try {
      const result = await this.histoiresService.generatePreview(userId, previewDto, uploadedImageUrls);

      this.logger.log(`[CONTROLLER] ✅ Preview generation successful: ${result.previewUrls?.length || 0} preview URLs generated`);
      this.logger.log(`[CONTROLLER] 📋 Preview URLs:`, result.previewUrls);
      this.logger.log(`[CONTROLLER] 📄 PDF URL:`, result.pdfUrl);
      this.logger.log(`[CONTROLLER] 🆔 Histoire ID:`, result.histoireId);

      return {
        success: true,
        previewUrls: result.previewUrls || [],
        pdfUrl: result.pdfUrl,
        histoireId: result.histoireId,
        processingSummary: {
          uploadedImages: uploadedImageUrls.length,
          mappedVariables: addedImageVars,
          fileErrors: fileProcessingErrors.length > 0 ? fileProcessingErrors : undefined
        }
      };
    } catch (error) {
      this.logger.error(`[CONTROLLER] ❌ Preview generation failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Preview generation failed: ${error.message}`);
    }
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
    // Configuration cohérente avec preview - accepte tous les champs d'images
    { name: 'images_photo', maxCount: 1 },
    { name: 'images_image', maxCount: 1 },
    { name: 'images_picture', maxCount: 1 },
    { name: 'images_portrait', maxCount: 1 },
    { name: 'images_avatar', maxCount: 1 },
    { name: 'images_personnage', maxCount: 1 },
    { name: 'images_scene', maxCount: 1 },
    { name: 'images_fond', maxCount: 1 },
    { name: 'images_objet', maxCount: 1 },
    { name: 'images_autre', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const uploadPath = join(process.cwd(), 'uploads', 'temp-images');
        try {
          mkdirSync(uploadPath, { recursive: true });
          callback(null, uploadPath);
        } catch (error) {
          callback(error, uploadPath);
        }
      },
      filename: (req, file, callback) => {
        const variableName = (file.fieldname || '').replace('images_', '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname);
        callback(null, `${variableName}-${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      const logger = req.res?.locals?.logger || new Logger('FileUpload');
      const fileType = file.mimetype || 'unknown';
      if (!fileType.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        const errorMsg = `Invalid file type: ${fileType}. Only image files are allowed!`;
        logger.error(`[CONTROLLER] File filter rejected: ${errorMsg}`);
        return callback(new BadRequestException(errorMsg || 'Invalid file type'), false);
      }
      const fileName = file.originalname || 'unknown';
      if (fileName && fileType) {
        logger.log(`[CONTROLLER] File filter accepted: ${fileName} (${fileType})`);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB par fichier
      files: 10, // Maximum 10 fichiers
    },
  }))
  async generateHistoire(
    @Body() body: any,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Request() req,
  ) {
    const userId = req.user.userId;
    this.logger.log(`[CONTROLLER] 🎯 Generating final PDF for template ${body.templateId} by user ${userId}`);
    
    // Validation des paramètres requis
    if (!body.templateId) {
      throw new BadRequestException('Template ID is required');
    }
    
    if (!body.variables) {
      throw new BadRequestException('Variables object is required');
    }

    // Extract uploaded image paths and map them to variable names (local file paths)
    const uploadedImageUrls: string[] = [];
    const imageVariableMapping: Record<string, string> = {};
    const fileProcessingErrors: string[] = [];

    if (files && Object.keys(files).length > 0) {
      this.logger.log(`[CONTROLLER] Processing ${Object.keys(files).length} file fields for generation`);

      for (const [fieldName, fileArray] of Object.entries(files)) {
        try {
          if (fieldName.startsWith('images_') && fileArray && fileArray.length > 0) {
            const variableName = fieldName.replace('images_', '');
            const file = fileArray[0];

            // Validation du fichier uploadé (diskStorage fournit path comme chemin local)
            if (!file || !file.path) {
              const errorMsg = `Invalid file data for field "${fieldName}"`;
              this.logger.error(`[CONTROLLER] ${errorMsg}`);
              fileProcessingErrors.push(errorMsg);
              continue;
            }

            uploadedImageUrls.push(file.path); // Local file path
            imageVariableMapping[variableName] = file.path; // Store local file path

            this.logger.log(`[CONTROLLER] ✅ Mapped generation image variable "${variableName}" to local path "${file.path}"`);
          }
        } catch (error) {
          const errorMsg = `Error processing file field "${fieldName}": ${error.message}`;
          this.logger.error(`[CONTROLLER] ${errorMsg}`);
          fileProcessingErrors.push(errorMsg);
        }
      }
    } else {
      this.logger.log(`[CONTROLLER] No image files uploaded for generation`);
    }

    this.logger.log(`[CONTROLLER] 📊 File processing summary: ${uploadedImageUrls.length} files processed, ${fileProcessingErrors.length} errors`);

    // Parse variables from form data with enhanced error handling
    let variables;
    try {
      variables = typeof body.variables === 'string' ? JSON.parse(body.variables) : body.variables;
      
      if (!variables || typeof variables !== 'object') {
        throw new Error('Variables must be a valid object');
      }
      
      this.logger.log(`[CONTROLLER] ✅ Parsed ${Object.keys(variables).length} variables`);
    } catch (error) {
      const errorMsg = `Failed to parse variables: ${error.message}`;
      this.logger.error(`[CONTROLLER] ❌ ${errorMsg}`);
      throw new BadRequestException(`Variables must be a valid JSON object: ${error.message}`);
    }

    // Add image filenames to variables for PDF generation (ENHANCED)
    const addedImageVars: string[] = [];
    Object.entries(imageVariableMapping).forEach(([variableName, filename]) => {
      variables[variableName] = filename;
      addedImageVars.push(variableName);
      this.logger.log(`[CONTROLLER] ✅ Added generation image variable "${variableName}" with filename "${filename}"`);
    });

    this.logger.log(`[CONTROLLER] 📸 Added ${addedImageVars.length} image variables to the variables object`);

    const generateDto: GenerateHistoireDto = {
      templateId: body.templateId,
      variables,
    };

    this.logger.log(`[CONTROLLER] 🎯 Calling histoiresService.generateHistoire with:`, {
      userId,
      templateId: generateDto.templateId,
      variablesCount: Object.keys(generateDto.variables).length,
      uploadedImageUrlsCount: uploadedImageUrls.length
    });

    try {
      const result = await this.histoiresService.generateHistoire(userId, generateDto, uploadedImageUrls);
      
      this.logger.log(`[CONTROLLER] ✅ Histoire generation successful for user ${userId}, histoire ID: ${result._id}`);
      
      return {
        success: true,
        histoire: result,
        processingSummary: {
          uploadedImages: uploadedImageUrls.length,
          mappedVariables: addedImageVars,
          fileErrors: fileProcessingErrors.length > 0 ? fileProcessingErrors : undefined
        }
      };
    } catch (error) {
      this.logger.error(`[CONTROLLER] ❌ Histoire generation failed for user ${userId}: ${error.message}`, error.stack);
      throw new BadRequestException(`Histoire generation failed: ${error.message}`);
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