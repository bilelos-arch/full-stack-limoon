import { Document } from 'mongoose';
export type TestimonialDocument = Testimonial & Document;
export declare class Testimonial {
    name: string;
    childName: string;
    childAge: number;
    location: string;
    content: string;
    rating: number;
    avatarSeed: string;
    avatarConfig: {
        hair: string[];
        hairColor: string[];
        skinColor: string[];
        eyes: string[];
        eyebrows: string[];
        mouth: string[];
        earrings?: string[];
        glasses?: string[];
        features?: string[];
        backgroundColor: string[];
    };
    storyTitle: string;
    highlight: string;
    size: 'small' | 'medium' | 'large' | 'xlarge';
    isActive: boolean;
}
export declare const TestimonialSchema: import("mongoose").Schema<Testimonial, import("mongoose").Model<Testimonial, any, any, any, Document<unknown, any, Testimonial, any, {}> & Testimonial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Testimonial, Document<unknown, {}, import("mongoose").FlatRecord<Testimonial>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Testimonial> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
