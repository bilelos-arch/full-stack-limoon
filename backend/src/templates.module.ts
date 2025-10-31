import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Template, TemplateSchema } from './template.schema';
import { EditorElementsController } from './editor-elements.controller';
import { EditorElementsService } from './editor-elements.service';
import { EditorElement, EditorElementSchema } from './editor-element.schema';
import { CoordinateMigrationService } from './migrate-coordinates';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Template.name, schema: TemplateSchema },
      { name: EditorElement.name, schema: EditorElementSchema },
    ]),
  ],
  controllers: [TemplatesController, EditorElementsController],
  providers: [TemplatesService, EditorElementsService, CoordinateMigrationService],
  exports: [TemplatesService, EditorElementsService, CoordinateMigrationService],
})
export class TemplatesModule {}