import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { AdminModule } from './admin/admin.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [AuthModule, UsersModule, AccountsModule, AdminModule, TransactionsModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
