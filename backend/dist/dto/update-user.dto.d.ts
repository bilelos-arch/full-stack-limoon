export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: 'admin' | 'user';
    status?: 'active' | 'inactive' | 'suspended';
}
