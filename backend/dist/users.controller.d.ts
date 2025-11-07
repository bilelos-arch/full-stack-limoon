import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponse, PaginatedUsersResponse } from './dto/user-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<any>;
    getAllUsers(query: QueryUsersDto): Promise<PaginatedUsersResponse>;
    getUserById(id: string): Promise<UserResponse>;
    createUser(createUserDto: CreateUserDto): Promise<any>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse>;
    deleteUser(id: string, req: any): Promise<{
        message: string;
    }>;
}
