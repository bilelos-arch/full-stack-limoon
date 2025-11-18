import { TestimonialsService } from './testimonials.service';
export declare class TestimonialsController {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    findAll(limit?: string): Promise<import("./testimonial.schema").TestimonialDocument[]>;
}
