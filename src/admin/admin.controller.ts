import { Controller, Post, Body } from '@nestjs/common';

import { LoginDto } from 'src/auth/dto/login.dto';
import { AdminService } from './admin.service';
import { RegisterDto } from 'src/auth/dto/register.dto';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return await this.adminService.adminLogin(loginDto);
  }


  @Post('register')
  async adminRegister(@Body() registerDto: RegisterDto) {
    return await this.adminService.adminRegister(registerDto);
  }
}