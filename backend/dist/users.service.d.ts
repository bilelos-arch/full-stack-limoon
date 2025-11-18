import { Model } from 'mongoose';
import { UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponse, PaginatedUsersResponse } from './dto/user-response.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: CreateUserDto): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    validatePassword(password: string, hashedPassword: string): Promise<boolean>;
    findAll(query: QueryUsersDto): Promise<PaginatedUsersResponse>;
    findOne(id: string): Promise<UserResponse | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse | null>;
    updateChildProfile(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse | null>;
    remove(id: string): Promise<boolean>;
    updateLastLogin(userId: string): Promise<void>;
    private transformUserResponse;
}
