import {
  Controller,
  Get,
  Post,
  Put,
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
    return profile;
  }

  // Endpoints administrateur
  @Roles('admin')
  @Get()
  async getAllUsers(@Query() query: QueryUsersDto): Promise<PaginatedUsersResponse> {
    return this.usersService.findAll(query);
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
    const { passwordHash, ...userResponse } = user.toObject();
    return userResponse;
  }

  @Roles('admin')
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponse> {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.usersService.findOne(id);
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