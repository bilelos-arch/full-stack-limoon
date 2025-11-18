export declare class ChildAvatarDto {
    name?: string;
    age?: string;
    gender?: 'boy' | 'girl' | 'unisex';
    mood?: string;
    hairType?: string;
    hairColor?: string;
    skinTone?: string;
    eyes?: string;
    eyebrows?: string;
    mouth?: string;
    glasses?: boolean;
    glassesStyle?: string;
    accessories?: string;
    earrings?: string;
    features?: string;
}
export declare class UpdateUserDto {
    name?: string;
    fullName?: string;
    email?: string;
    password?: string;
    phone?: string;
    avatarUrl?: string;
    country?: string;
    city?: string;
    role?: 'admin' | 'user';
    status?: 'active' | 'inactive' | 'suspended';
    child?: ChildAvatarDto;
    childAvatar?: string;
    settings?: {
        language?: string;
        theme?: string;
        notifications?: boolean;
    };
}
