import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { FundingRequest } from './entities/funding-request.entity';
import { Transaction } from './entities/transaction.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FundingRequest, Transaction]),
    AuthModule, // ✅ reuse JwtModule config from AuthModule
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
