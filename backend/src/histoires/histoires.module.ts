import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoiresController } from './histoires.controller';
import { HistoiresService } from './histoires.service';
import { Histoire, HistoireSchema } from './schemas/histoire.schema';
import { PdfGeneratorService } from './utils/pdf-generator.service';
import { ImageMappingService } from './utils/image-mapping.service';
import { TemplatesModule } from '../templates.module';
import { UsersModule } from '../users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Histoire.name, schema: HistoireSchema }]),
    forwardRef(() => TemplatesModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [HistoiresController],
  providers: [HistoiresService, PdfGeneratorService, ImageMappingService],
  exports: [HistoiresService, PdfGeneratorService, ImageMappingService],
})
export class HistoiresModule {}