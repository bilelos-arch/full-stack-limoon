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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./user.schema");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const { password, ...userData } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = new this.userModel({
            ...userData,
            passwordHash: hashedPassword,
        });
        return createdUser.save();
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email, deletedAt: { $exists: false } }).exec();
    }
    async findById(id) {
        return this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
    }
    async validatePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', role, status } = query;
        const filter = { deletedAt: { $exists: false } };
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            filter.role = role;
        }
        if (status) {
            filter.status = status;
        }
        const total = await this.userModel.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const users = await this.userModel
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
        const transformedUsers = users.map(user => this.transformUserResponse(user));
        return {
            users: transformedUsers,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }
    async findOne(id) {
        const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
        return user ? this.transformUserResponse(user) : null;
    }
    async update(id, updateUserDto) {
        console.log('Users Service: update called with id:', id);
        console.log('Users Service: updateUserDto:', updateUserDto);
        const existingUser = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
        console.log('Users Service: existingUser found:', !!existingUser);
        if (!existingUser) {
            console.log('Users Service: User not found, returning null');
            return null;
        }
        const { password, ...updateData } = updateUserDto;
        console.log('Users Service: updateData after password removal:', updateData);
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
            console.log('Users Service: Password hashed and added to updateData');
        }
        console.log('Users Service: Final updateData to apply:', { ...updateData, updatedAt: new Date() });
        const user = await this.userModel
            .findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true })
            .exec();
        console.log('Users Service: Update result:', user ? 'success' : 'failed');
        if (user) {
            console.log('Users Service: Updated user email:', user.email);
        }
        return user ? this.transformUserResponse(user) : null;
    }
    async remove(id) {
        const existingUser = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
        if (!existingUser) {
            return false;
        }
        const result = await this.userModel
            .findByIdAndUpdate(id, {
            deletedAt: new Date(),
            status: 'inactive'
        }, { new: true })
            .exec();
        return !!result;
    }
    async updateLastLogin(userId) {
        await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() }).exec();
    }
    transformUserResponse(user) {
        const userObject = user.toObject();
        return {
            _id: userObject._id.toString(),
            fullName: userObject.fullName,
            email: userObject.email,
            phone: userObject.phone,
            avatarUrl: userObject.avatarUrl,
            birthDate: userObject.birthDate,
            country: userObject.country,
            city: userObject.city,
            settings: userObject.settings,
            storyHistory: userObject.storyHistory || [],
            purchaseHistory: userObject.purchaseHistory || [],
            role: userObject.role,
            status: userObject.status,
            createdAt: userObject.createdAt,
            updatedAt: userObject.updatedAt,
            lastLogin: userObject.lastLogin
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map