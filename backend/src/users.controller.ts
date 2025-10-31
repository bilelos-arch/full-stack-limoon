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
    const user = await this.usersService.findById(req.user.userId);
    const { passwordHash, ...profile } = user.toObject();
    return profile;
  }

  @Roles('admin')
  @Get()
  async getAllUsers() {
    // Implementation for getting all users, if needed
    return { message: 'Get all users' };
  }
}