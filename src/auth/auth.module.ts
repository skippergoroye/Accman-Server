import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Verification } from './entities/verification.entity';
import { EmailService } from '../email/email.service';
import { User } from 'src/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verification]),
    JwtModule.register({
       global: true,
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: process.env.JWT_EXPIRE_DAY || '1d' },
    }),
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
