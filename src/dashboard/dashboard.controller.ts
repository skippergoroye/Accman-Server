import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add-funds')
  async addFunds(@Req() req, @Body('amount') amount: number) {
    return this.dashboardService.addFunds(req.user.sub, amount);
  }
}

