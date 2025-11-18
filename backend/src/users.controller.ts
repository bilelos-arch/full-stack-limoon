import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponse, PaginatedUsersResponse } from './dto/user-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    console.log('Users Controller: getProfile called');
    const user = await this.usersService.findById(req.user.userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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
      child: profile.child,
      childAvatar: profile.childAvatar,
      role: profile.role,
      status: profile.status,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      lastLogin: profile.lastLogin
    };
  }

  @Get('profile/:id')
  async getUserProfileById(@Param('id') id: string, @Req() req: any) {
    console.log('Users Controller: getUserProfileById called for id:', id);
    console.log('Users Controller: Request user object:', req.user);
    console.log('Users Controller: Request user userId:', req.user?.userId);
    console.log('Users Controller: Request user role:', req.user?.role);

    // Allow users to view their own profile or admins to view any profile
    if (req.user.userId !== id && req.user.role !== 'admin') {
      console.log('Users Controller: Access denied - userId mismatch or not admin');
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    const user = await this.usersService.findById(id);

    if (!user) {
      console.log('Users Controller: User not found for id:', id);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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
      child: profile.child,
      childAvatar: profile.childAvatar,
      role: profile.role,
      status: profile.status,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      lastLogin: profile.lastLogin
    };
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    console.log('Users Controller: updateProfile called');
    console.log('Users Controller: Request user:', req.user);
    console.log('Users Controller: Update data received:', updateData);

    const user = await this.usersService.update(req.user.userId, updateData);
    console.log('Users Controller: Update result:', user);

    if (!user) {
      console.log('Users Controller: Update failed - no user returned');
      throw new HttpException('Failed to update profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    console.log('Users Controller: Profile updated successfully for user:', user.email);
    return user;
  }

  @Patch('profile/:id')
  async updateChildProfile(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateData: UpdateUserDto
  ) {
    console.log('Users Controller: updateChildProfile called for id:', id);
    console.log('Users Controller: Request user:', req.user);
    console.log('Users Controller: Update data received:', updateData);

    // Vérifier les permissions : utilisateur peut modifier son propre profil ou admin peut modifier n'importe quel profil
    if (req.user.userId !== id && req.user.role !== 'admin') {
      console.log('Users Controller: Access denied - userId mismatch or not admin');
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    try {
      const user = await this.usersService.updateChildProfile(id, updateData);
      
      if (!user) {
        console.log('Users Controller: Update failed - no user returned');
        throw new HttpException('Failed to update child profile', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      console.log('Users Controller: Child profile updated successfully for user:', user.email);
      return {
        success: true,
        message: 'Profil enfant mis à jour avec succès',
        user: user
      };
    } catch (error) {
      console.error('Users Controller: Error updating child profile:', error);
      throw new HttpException(
        'Erreur lors de la mise à jour du profil enfant: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('profile/stories')
  async getUserStories(@Req() req: any) {
    console.log('Users Controller: getUserStories called');
    const user = await this.usersService.findById(req.user.userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user.storyHistory || [];
  }

  @Get('profile/purchases')
  async getUserPurchases(@Req() req: any) {
    console.log('Users Controller: getUserPurchases called');
    const user = await this.usersService.findById(req.user.userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user.purchaseHistory || [];
  }

  // Endpoints administrateur
  @Roles('admin')
  @Get()
  async getAllUsers(@Query() query: QueryUsersDto): Promise<PaginatedUsersResponse> {
    return this.usersService.findAll(query);
  }

  @Roles('admin')
  @Get(':id/stories')
  async getUserStoriesAdmin(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user.storyHistory || [];
  }

  @Roles('admin')
  @Get(':id/purchases')
  async getUserPurchasesAdmin(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user.purchaseHistory || [];
  }

  @Roles('admin')
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.usersService.findOne(id);
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  @Roles('admin')
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const user = await this.usersService.create(createUserDto);
    return this.usersService.findOne(user._id.toString());
  }

  @Roles('admin')
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponse> {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.usersService.findById(id);
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Si l'email est modifié, vérifier qu'il n'est pas déjà pris
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithSameEmail = await this.usersService.findByEmail(updateUserDto.email);
      if (userWithSameEmail) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
    }

    const updatedUser = await this.usersService.update(id, updateUserDto);

    if (!updatedUser) {
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return updatedUser;
  }

  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.usersService.findOne(id);
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Empêcher la suppression de son propre compte
    if (id === req.user.userId) {
      throw new HttpException('Cannot delete your own account', HttpStatus.FORBIDDEN);
    }

    const deleted = await this.usersService.remove(id);
    
    if (!deleted) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: 'User deleted successfully' };
  }
}