import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoireDto } from './create-histoire.dto';

export class UpdateHistoireDto extends PartialType(CreateHistoireDto) {}