import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from './users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => req.cookies?.accessToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy: Validating token payload:', payload);
    const user = await this.usersService.findById(payload.sub);
    console.log('JWT Strategy: User found:', !!user);
    if (!user) {
      console.log('JWT Strategy: User not found, throwing UnauthorizedException');
      throw new UnauthorizedException();
    }
    console.log('JWT Strategy: Validation successful for user:', user.email);
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}