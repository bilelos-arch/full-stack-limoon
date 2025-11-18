import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';

@Controller('testimonials')
@UseGuards()
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  async findAll(@Query('limit') limit?: string) {
    const testimonialLimit = limit ? parseInt(limit, 10) : 12;
    return this.testimonialsService.findAll(testimonialLimit);
  }
}