import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';
declare const RefreshTokenStrategy_base: new (...args: any[]) => Strategy;
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(req: Request, payload: any): Promise<{
        userId: any;
        email: any;
        role: any;
    }>;
}
export {};
