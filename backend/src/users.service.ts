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
    console.log('Users Service: update called with id:', id);
    console.log('Users Service: updateUserDto:', updateUserDto);

    // Vérifier si l'utilisateur existe et n'est pas supprimé
    const existingUser = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
    console.log('Users Service: existingUser found:', !!existingUser);
    if (!existingUser) {
      console.log('Users Service: User not found, returning null');
      return null;
    }

    const { password, ...updateData } = updateUserDto;
    console.log('Users Service: updateData after password removal:', updateData);

    if (password) {
      (updateData as any).passwordHash = await bcrypt.hash(password, 10);
      console.log('Users Service: Password hashed and added to updateData');
    }

    console.log('Users Service: Final updateData to apply:', { ...updateData, updatedAt: new Date() });

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    console.log('Users Service: Update result:', user ? 'success' : 'failed');
    if (user) {
      console.log('Users Service: Updated user email:', user.email);
    }

    return user ? this.transformUserResponse(user) : null;
  }

  async updateChildProfile(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse | null> {
    console.log('Users Service: updateChildProfile called with id:', id);
    console.log('Users Service: updateUserDto:', updateUserDto);

    // Vérifier si l'utilisateur existe et n'est pas supprimé
    const existingUser = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
    console.log('Users Service: existingUser found:', !!existingUser);
    if (!existingUser) {
      console.log('Users Service: User not found, returning null');
      return null;
    }

    // Préparer les données de mise à jour spécifiques au profil enfant
    const updateData: any = { updatedAt: new Date() };

    // Mettre à jour les informations de l'enfant si présentes
    if (updateUserDto.child) {
      updateData.child = {
        ...existingUser.child,
        ...updateUserDto.child
      };
    }

    // Mettre à jour l'avatar de l'enfant si présent
    if (updateUserDto.childAvatar !== undefined) {
      updateData.childAvatar = updateUserDto.childAvatar;
    }

    // Permettre aussi la mise à jour d'autres champs utilisateur standards
    if (updateUserDto.fullName) updateData.fullName = updateUserDto.fullName;
    if (updateUserDto.avatarUrl) updateData.avatarUrl = updateUserDto.avatarUrl;
    if (updateUserDto.phone) updateData.phone = updateUserDto.phone;
    if (updateUserDto.country) updateData.country = updateUserDto.country;
    if (updateUserDto.city) updateData.city = updateUserDto.city;
    if (updateUserDto.settings) {
      updateData.settings = {
        ...existingUser.settings,
        ...updateUserDto.settings
      };
    }

    console.log('Users Service: Final updateData to apply for child profile:', updateData);

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )
      .exec();

    console.log('Users Service: Child profile update result:', user ? 'success' : 'failed');
    if (user) {
      console.log('Users Service: Updated user email:', user.email);
      console.log('Users Service: Child data:', user.child);
      console.log('Users Service: ChildAvatar:', user.childAvatar);
    }

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
      child: userObject.child,
      childAvatar: userObject.childAvatar,
      role: userObject.role,
      status: userObject.status,
      createdAt: userObject.createdAt,
      updatedAt: userObject.updatedAt,
      lastLogin: userObject.lastLogin
    };
  }
}