import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';

import { LoginDto } from 'src/auth/dto/login.dto';
import { AdminService } from './admin.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';

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

  @Get('getusers')
  @UseGuards(AdminGuard)
  getAllUsers(@Query('new') query: string, @Req() req: any) {
    const isNew = query === 'true';
    return this.adminService.getAllUsers(isNew, req.user);
  }

  @Get('dashboard')
  @UseGuards(AdminGuard)
  async getDashboard() {
    const dashboardData = await this.adminService.getAdminDashboardData();
    return {
      status_code: 200,
      status: 'success',
      data: dashboardData,
    };
  }

  @Get('fund/requests')
  @UseGuards(AdminGuard)
  async getPendingRequests() {
    return this.adminService.getPendingFundingRequest();
  }

  @Patch('approve/:requestId')
  @UseGuards(AdminGuard)
  approveFundingRequest(@Param('requestId') requestId: string) {
    return this.adminService.approveFundingRequest(requestId);
  }


   @Get("transactions")
  @UseGuards(AdminGuard) // requireAuthAndAdmin equivalent
  async getAllTransactions() {
    return this.adminService.getAllTransactions();
  }


}
