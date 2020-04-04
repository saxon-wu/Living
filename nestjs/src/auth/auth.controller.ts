import { Controller, Post, Body, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './auth.dto';

@Controller('v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @UseInterceptors(ClassSerializerInterceptor)
    @Post('login')
    async login(@Body() loginDTO: LoginDTO){
        return await this.authService.login(loginDTO)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Post('register')
    async register(@Body() loginDTO: LoginDTO){
        return await this.authService.register(loginDTO)
    }
}
