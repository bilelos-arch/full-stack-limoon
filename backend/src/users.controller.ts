import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    console.log('Users Controller: getProfile called');
    console.log('Users Controller: req.user:', req.user);
    console.log('Users Controller: req.cookies:', req.cookies);
    const user = await this.usersService.findById(req.user.userId);
    console.log('Users Controller: User found:', !!user);
    if (!user) {
      console.log('Users Controller: User not found for ID:', req.user.userId);
    }
    const { passwordHash, ...profile } = user.toObject();
    console.log('Users Controller: Returning profile for user:', user.email);
    return profile;
  }

  @Roles('admin')
  @Get()
  async getAllUsers() {
    // Implementation for getting all users, if needed
    return { message: 'Get all users' };
  }
}