import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    fullName: string;
    email: string;
    phone?: string;
    passwordHash: string;
    avatarUrl?: string;
    birthDate?: Date;
    country?: string;
    city?: string;
    settings: {
        language: string;
        theme: string;
        notifications: boolean;
    };
    storyHistory: {
        id: string;
        title: string;
        createdAt: Date;
        category: string;
        language: string;
        link: string;
    }[];
    purchaseHistory: {
        id: string;
        productName: string;
        price: number;
        date: Date;
        paymentMethod: string;
        status: string;
        invoiceUrl: string;
    }[];
    role: 'admin' | 'user';
    status: 'active' | 'inactive' | 'suspended';
    child?: {
        name: string;
        age: string;
        gender: string;
        mood: string;
        hairType: string;
        hairColor: string;
        skinTone: string;
        eyes: string;
        eyebrows: string;
        mouth: string;
        glasses: boolean;
        glassesStyle: string;
        accessories: string;
        earrings: string;
        features: string;
    };
    childAvatar?: string;
    lastLogin?: Date;
    deletedAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
