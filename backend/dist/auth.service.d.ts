import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { RefreshTokenDocument } from './refresh-token.schema';
import { UsersService } from './users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private refreshTokenModel;
    constructor(usersService: UsersService, jwtService: JwtService, refreshTokenModel: Model<RefreshTokenDocument>);
    register(name: string, email: string, password: string, role: 'admin' | 'user'): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
    private saveRefreshToken;
    validateRefreshToken(userId: string, token: string): Promise<boolean>;
}
