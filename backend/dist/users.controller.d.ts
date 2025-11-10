import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponse, PaginatedUsersResponse } from './dto/user-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        _id: any;
        fullName: any;
        email: any;
        phone: any;
        avatarUrl: any;
        birthDate: any;
        country: any;
        city: any;
        settings: any;
        storyHistory: any;
        purchaseHistory: any;
        role: any;
        status: any;
        createdAt: any;
        updatedAt: any;
        lastLogin: any;
    }>;
    getUserProfileById(id: string, req: any): Promise<{
        _id: any;
        fullName: any;
        email: any;
        phone: any;
        avatarUrl: any;
        birthDate: any;
        country: any;
        city: any;
        settings: any;
        storyHistory: any;
        purchaseHistory: any;
        role: any;
        status: any;
        createdAt: any;
        updatedAt: any;
        lastLogin: any;
    }>;
    updateProfile(req: any, updateData: any): Promise<UserResponse>;
    getUserStories(req: any): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        category: string;
        language: string;
        link: string;
    }[]>;
    getUserPurchases(req: any): Promise<{
        id: string;
        productName: string;
        price: number;
        date: Date;
        paymentMethod: string;
        status: string;
        invoiceUrl: string;
    }[]>;
    getAllUsers(query: QueryUsersDto): Promise<PaginatedUsersResponse>;
    getUserStoriesAdmin(id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        category: string;
        language: string;
        link: string;
    }[]>;
    getUserPurchasesAdmin(id: string): Promise<{
        id: string;
        productName: string;
        price: number;
        date: Date;
        paymentMethod: string;
        status: string;
        invoiceUrl: string;
    }[]>;
    getUserById(id: string): Promise<UserResponse>;
    createUser(createUserDto: CreateUserDto): Promise<UserResponse>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse>;
    deleteUser(id: string, req: any): Promise<{
        message: string;
    }>;
}
