import { Document, Types } from 'mongoose';
export type HistoireDocument = Histoire & Document;
export declare class Histoire {
    templateId: Types.ObjectId;
    userId: Types.ObjectId;
    variables: Record<string, any>;
    previewUrls?: string[];
    pdfUrl?: string;
    generatedPdfUrl?: string;
}
export declare const HistoireSchema: import("mongoose").Schema<Histoire, import("mongoose").Model<Histoire, any, any, any, Document<unknown, any, Histoire, any, {}> & Histoire & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Histoire, Document<unknown, {}, import("mongoose").FlatRecord<Histoire>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Histoire> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
