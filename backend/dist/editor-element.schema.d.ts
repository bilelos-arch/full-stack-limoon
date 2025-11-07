interface FontStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
}
import { Document, Types } from 'mongoose';
export declare class EditorElement extends Document {
    templateId: Types.ObjectId;
    type: 'text' | 'image';
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    textContent?: string;
    font?: string;
    fontSize?: number;
    fontStyle?: FontStyle;
    googleFont?: string;
    color?: string;
    backgroundColor?: string;
    alignment?: 'left' | 'center' | 'right';
    variableName?: string;
    variables?: string[];
    defaultValues?: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const EditorElementSchema: import("mongoose").Schema<EditorElement, import("mongoose").Model<EditorElement, any, any, any, Document<unknown, any, EditorElement, any, {}> & EditorElement & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EditorElement, Document<unknown, {}, import("mongoose").FlatRecord<EditorElement>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EditorElement> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export {};
