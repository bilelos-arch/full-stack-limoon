import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { RefreshToken, RefreshTokenDocument } from './refresh-token.schema';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async register(name: string, email: string, password: string, role: 'admin' | 'user') {
    const user = await this.usersService.create({ name, email, password, role });
    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this.usersService.validatePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const isValid = await this.validateRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    return this.generateTokens(user);
  }

  private async generateTokens(user: UserDocument) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      expiresIn: '7d',
    });

    await this.saveRefreshToken(user._id.toString(), refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenModel.create({
      userId,
      token,
      expiresAt,
    });
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const refreshToken = await this.refreshTokenModel.findOne({
      userId,
      token,
      expiresAt: { $gt: new Date() },
    });
    return !!refreshToken;
  }
}