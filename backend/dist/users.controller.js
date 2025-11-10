"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const roles_guard_1 = require("./roles.guard");
const roles_decorator_1 = require("./roles.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const query_users_dto_1 = require("./dto/query-users.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        console.log('Users Controller: getProfile called');
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const { passwordHash, ...profile } = user.toObject();
        console.log('Users Controller: Returning profile for user:', user.email);
        return {
            _id: profile._id,
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            avatarUrl: profile.avatarUrl,
            birthDate: profile.birthDate,
            country: profile.country,
            city: profile.city,
            settings: profile.settings,
            storyHistory: profile.storyHistory,
            purchaseHistory: profile.purchaseHistory,
            role: profile.role,
            status: profile.status,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            lastLogin: profile.lastLogin
        };
    }
    async getUserProfileById(id, req) {
        console.log('Users Controller: getUserProfileById called for id:', id);
        console.log('Users Controller: Request user object:', req.user);
        console.log('Users Controller: Request user userId:', req.user?.userId);
        console.log('Users Controller: Request user role:', req.user?.role);
        if (req.user.userId !== id && req.user.role !== 'admin') {
            console.log('Users Controller: Access denied - userId mismatch or not admin');
            throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
        }
        const user = await this.usersService.findById(id);
        if (!user) {
            console.log('Users Controller: User not found for id:', id);
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        const { passwordHash, ...profile } = user.toObject();
        console.log('Users Controller: Returning profile for user:', user.email);
        return {
            _id: profile._id,
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            avatarUrl: profile.avatarUrl,
            birthDate: profile.birthDate,
            country: profile.country,
            city: profile.city,
            settings: profile.settings,
            storyHistory: profile.storyHistory,
            purchaseHistory: profile.purchaseHistory,
            role: profile.role,
            status: profile.status,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            lastLogin: profile.lastLogin
        };
    }
    async updateProfile(req, updateData) {
        console.log('Users Controller: updateProfile called');
        console.log('Users Controller: Request user:', req.user);
        console.log('Users Controller: Update data received:', updateData);
        const user = await this.usersService.update(req.user.userId, updateData);
        console.log('Users Controller: Update result:', user);
        if (!user) {
            console.log('Users Controller: Update failed - no user returned');
            throw new common_1.HttpException('Failed to update profile', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        console.log('Users Controller: Profile updated successfully for user:', user.email);
        return user;
    }
    async getUserStories(req) {
        console.log('Users Controller: getUserStories called');
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        return user.storyHistory || [];
    }
    async getUserPurchases(req) {
        console.log('Users Controller: getUserPurchases called');
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        return user.purchaseHistory || [];
    }
    async getAllUsers(query) {
        return this.usersService.findAll(query);
    }
    async getUserStoriesAdmin(id) {
        const user = await this.usersService.findById(id);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        return user.storyHistory || [];
    }
    async getUserPurchasesAdmin(id) {
        const user = await this.usersService.findById(id);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        return user.purchaseHistory || [];
    }
    async getUserById(id) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        return user;
    }
    async createUser(createUserDto) {
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new common_1.HttpException('Email already exists', common_1.HttpStatus.CONFLICT);
        }
        const user = await this.usersService.create(createUserDto);
        return this.usersService.findOne(user._id.toString());
    }
    async updateUser(id, updateUserDto) {
        const existingUser = await this.usersService.findById(id);
        if (!existingUser) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const userWithSameEmail = await this.usersService.findByEmail(updateUserDto.email);
            if (userWithSameEmail) {
                throw new common_1.HttpException('Email already exists', common_1.HttpStatus.CONFLICT);
            }
        }
        const updatedUser = await this.usersService.update(id, updateUserDto);
        if (!updatedUser) {
            throw new common_1.HttpException('Failed to update user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return updatedUser;
    }
    async deleteUser(id, req) {
        const existingUser = await this.usersService.findOne(id);
        if (!existingUser) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (id === req.user.userId) {
            throw new common_1.HttpException('Cannot delete your own account', common_1.HttpStatus.FORBIDDEN);
        }
        const deleted = await this.usersService.remove(id);
        if (!deleted) {
            throw new common_1.HttpException('Failed to delete user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return { message: 'User deleted successfully' };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('profile/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserProfileById", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('profile/stories'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStories", null);
__decorate([
    (0, common_1.Get)('profile/purchases'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserPurchases", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_users_dto_1.QueryUsersDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(':id/stories'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStoriesAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(':id/purchases'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserPurchasesAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map