import { AuthService } from './auth.service';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: Response): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto, res: Response): Promise<{
        message: string;
    }>;
    refresh(req: any, res: Response): Promise<{
        message: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    private setTokensInCookies;
}
