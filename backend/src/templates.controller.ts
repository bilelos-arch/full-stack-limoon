import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './create-template.dto';
import { UpdateTemplateDto } from './update-template.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = file.fieldname + '-' + uniqueSuffix + extname(file.originalname);
            console.log('Generated filename:', filename);
            callback(null, filename);
          },
        }),
        fileFilter: (req, file, callback) => {
          console.log('File filter check:', file.fieldname, file.mimetype);
          if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
            return callback(new BadRequestException('Only PDF files are allowed for pdf field'), false);
          }
          if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/')) {
            return callback(new BadRequestException('Only image files are allowed for cover field'), false);
          }
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      },
    ),
  )
  async create(
    @Body() createTemplateDto: CreateTemplateDto,
    @UploadedFiles() files: { pdf?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    console.log('=== CREATE TEMPLATE REQUEST ===');
    console.log('Raw Body:', JSON.stringify(createTemplateDto, null, 2));
    console.log('Body.ageRange:', createTemplateDto.ageRange);
    console.log('Body.ageRange type:', typeof createTemplateDto.ageRange);
    console.log('Body.ageRange is undefined:', createTemplateDto.ageRange === undefined);
    console.log('Body.ageRange is null:', createTemplateDto.ageRange === null);
    console.log('Body.ageRange is falsy:', !createTemplateDto.ageRange);
    console.log('Files received:', {
      pdf: files.pdf ? files.pdf[0]?.filename : 'MISSING',
      cover: files.cover ? files.cover[0]?.filename : 'MISSING'
    });

    if (!files.pdf || !files.cover) {
      console.log('ERROR: Missing files - PDF:', !!files.pdf, 'Cover:', !!files.cover);
      throw new BadRequestException('Both PDF and cover image are required');
    }

    const pdfPath = files.pdf[0].filename;
    const coverPath = files.cover[0].filename;

    console.log('Calling service with paths:', { pdfPath, coverPath });
    return this.templatesService.create(createTemplateDto, pdfPath, coverPath);
  }

  @Get()
  @UseGuards()
  async findAll(
    @Query('category') category?: string,
    @Query('gender') gender?: string,
    @Query('ageRange') ageRange?: string,
    @Query('isPublished') isPublished?: string,
    @Query('language') language?: string,
  ) {
    const query = { category, gender, ageRange, isPublished: isPublished !== undefined ? isPublished : 'true', language };
    return this.templatesService.findAll(query);
  }

  @Get('search')
  @UseGuards()
  async search(@Query('q') query?: string, @Query('limit') limit?: string) {
    const searchLimit = limit ? parseInt(limit, 10) : 10;
    return this.templatesService.search(query || '', searchLimit);
  }

  @Get(':id')
  @UseGuards()
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = file.fieldname + '-' + uniqueSuffix + extname(file.originalname);
            console.log('Generated filename for update:', filename);
            callback(null, filename);
          },
        }),
        fileFilter: (req, file, callback) => {
          console.log('File filter check for update:', file.fieldname, file.mimetype);
          if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
            return callback(new BadRequestException('Only PDF files are allowed for pdf field'), false);
          }
          if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/')) {
            return callback(new BadRequestException('Only image files are allowed for cover field'), false);
          }
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @UploadedFiles() files?: { pdf?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    return this.templatesService.update(id, updateTemplateDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.templatesService.remove(id);
    return { message: 'Template deleted successfully' };
  }
}