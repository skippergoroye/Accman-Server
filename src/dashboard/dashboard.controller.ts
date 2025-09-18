import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Get,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import type { JwtPayload } from './interface/authuserinterface';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('add-funds')
  async addFunds(@Req() req, @Body('amount') amount: number) {
    return this.dashboardService.addFunds(req.user.sub, amount);
  }

  @Get('find/user/:id')
  async getTransactionsByUserId(
    @Param('id') userId: string,
    @GetUser() authUser: JwtPayload,
  ) {
    return this.dashboardService.getTransactionsByUserId(userId, authUser);
  }


   @Get('balance')
   async getBalance(@GetUser() authUser: JwtPayload) {
    return this.dashboardService.getUserBalance(authUser.sub);
  }
}
