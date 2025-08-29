import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/user')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // @Post('login/user')
  // async login(@Body() dto: LoginDto) {
  //   return this.authService.login(dto);
  // }
}
