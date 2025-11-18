import { Model } from 'mongoose';
import { TestimonialDocument } from './testimonial.schema';
export declare class TestimonialsService {
    private testimonialModel;
    constructor(testimonialModel: Model<TestimonialDocument>);
    findAll(limit?: number): Promise<TestimonialDocument[]>;
    private getFallbackTestimonials;
}
