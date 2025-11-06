import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponse, PaginatedUsersResponse } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const createdUser = new this.userModel({
      ...userData,
      passwordHash: hashedPassword,
    });
    
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, deletedAt: { $exists: false } }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async findAll(query: QueryUsersDto): Promise<PaginatedUsersResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      status
    } = query;

    // Construire le filtre de base
    const filter: any = { deletedAt: { $exists: false } };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    // Compter le total
    const total = await this.userModel.countDocuments(filter);
    
    // Calculer la pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Construire l'objet de tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Récupérer les utilisateurs
    const users = await this.userModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    // Transformer les données pour la réponse
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

  async findOne(id: string): Promise<UserResponse | null> {
    const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
    return user ? this.transformUserResponse(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse | null> {
    // Vérifier si l'utilisateur existe et n'est pas supprimé
    const existingUser = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
    if (!existingUser) {
      return null;
    }

    const { password, ...updateData } = updateUserDto;

    if (password) {
      (updateData as any).passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    return user ? this.transformUserResponse(user) : null;
  }

  async remove(id: string): Promise<boolean> {
    // Vérifier si l'utilisateur existe et n'est pas déjà supprimé
    const existingUser = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
    if (!existingUser) {
      return false;
    }

    // Soft delete en marquant deletedAt
    const result = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          deletedAt: new Date(),
          status: 'inactive'
        },
        { new: true }
      )
      .exec();

    return !!result;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() }
    ).exec();
  }

  private transformUserResponse(user: UserDocument): UserResponse {
    const userObject = user.toObject();
    return {
      _id: userObject._id.toString(),
      name: userObject.name,
      email: userObject.email,
      role: userObject.role,
      status: userObject.status,
      createdAt: userObject.createdAt,
      updatedAt: userObject.updatedAt,
      lastLogin: userObject.lastLogin,
      storiesCount: userObject.storiesCount || 0
    };
  }
}