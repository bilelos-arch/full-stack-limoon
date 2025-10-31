import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { HistoiresService } from './histoires.service';
import { CreateHistoireDto } from './dto/create-histoire.dto';
import { UpdateHistoireDto } from './dto/update-histoire.dto';
import { PreviewHistoireDto } from './dto/preview-histoire.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('histoires')
export class HistoiresController {
  private readonly logger = new Logger(HistoiresController.name);

  constructor(private readonly histoiresService: HistoiresService) {}

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
}