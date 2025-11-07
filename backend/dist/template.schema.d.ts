import { Document } from 'mongoose';
export type TemplateDocument = Template & Document;
export declare class Template {
    title: string;
    description: string;
    category: 'Contes et aventures imaginaires' | 'Héros du quotidien' | 'Histoires avec des animaux' | 'Histoires éducatives' | 'Valeurs et développement personnel' | 'Vie quotidienne et école' | 'Fêtes et occasions spéciales' | 'Exploration et science-fiction' | 'Culture et traditions' | 'Histoires du soir';
    gender: 'boy' | 'girl' | 'unisex';
    ageRange: '3 ans - 5 ans' | '6 ans - 8 ans' | '9 ans - 11 ans' | '12 ans - 15 ans';
    language: 'Français' | 'Anglais' | 'Arabe';
    pdfPath: string;
    coverPath: string;
    pageCount?: number;
    dimensions?: {
        width: number;
        height: number;
    };
    variables: string[];
    isPublished: boolean;
}
export declare const TemplateSchema: import("mongoose").Schema<Template, import("mongoose").Model<Template, any, any, any, Document<unknown, any, Template, any, {}> & Template & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Template, Document<unknown, {}, import("mongoose").FlatRecord<Template>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Template> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
