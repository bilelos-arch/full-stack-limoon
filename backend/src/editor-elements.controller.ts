import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EditorElementsService } from './editor-elements.service';
import { EditorElement } from './editor-element.schema';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('templates/:id/elements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EditorElementsController {
  constructor(private readonly editorElementsService: EditorElementsService) {}

  @Get()
  @Roles('admin')
  async findAll(@Param('id') templateId: string): Promise<EditorElement[]> {
    return this.editorElementsService.findAllByTemplate(templateId);
  }

  @Post()
  @Roles('admin')
  async create(
    @Param('id') templateId: string,
    @Body() elementData: Partial<EditorElement>,
  ): Promise<EditorElement> {
    return this.editorElementsService.create(templateId, elementData);
  }

  @Put(':elementId')
  @Roles('admin')
  async update(
    @Param('id') templateId: string,
    @Param('elementId') elementId: string,
    @Body() elementData: Partial<EditorElement>,
  ): Promise<EditorElement> {
    return this.editorElementsService.update(templateId, elementId, elementData);
  }

  @Delete(':elementId')
  @Roles('admin')
  async remove(
    @Param('id') templateId: string,
    @Param('elementId') elementId: string,
  ): Promise<void> {
    await this.editorElementsService.remove(templateId, elementId);
    return;
  }
}