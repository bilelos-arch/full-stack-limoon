import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from './users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => req.cookies?.accessToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy: Validating token payload:', payload);
    console.log('JWT Strategy: Payload sub (userId):', payload.sub);
    const user = await this.usersService.findById(payload.sub);
    console.log('JWT Strategy: User found:', !!user);
    if (!user) {
      console.log('JWT Strategy: User not found, throwing UnauthorizedException');
      throw new UnauthorizedException();
    }
    console.log('JWT Strategy: Validation successful for user:', user.email);
    console.log('JWT Strategy: Returning user object:', { userId: payload.sub, email: payload.email, role: payload.role });
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}