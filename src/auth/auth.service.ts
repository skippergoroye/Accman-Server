import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Verification } from './entities/verification.entity';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ status: string; message: string; user: User; accessToken: string }> {
    const { firstName, lastName, email, password, phoneNumber } = registerDto;
    const sanitizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const userExists = await this.userRepository.findOne({
      where: { email: sanitizedEmail },
    });
    if (userExists) {
      throw new BadRequestException({
        status: 'error',
        message: 'User already exists',
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = this.userRepository.create({
      firstName: firstName,
      lastName: lastName,
      email: sanitizedEmail,
      password: hash,
      phoneNumber: phoneNumber,
      isVerified: false,
      walletBalance: 0,
    });

    const savedUser: User = await this.userRepository.save(newUser);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.verificationRepository.save(
      this.verificationRepository.create({ email: sanitizedEmail, otp, expiresAt }),
    );

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(sanitizedEmail, otp);
    } catch {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to send verification email',
      });
    }

    // Generate JWT
    const accessToken = this.jwtService.sign({
      sub: savedUser.id,
      role: savedUser.role,
    });

    return {
      status: 'success',
      message: 'User registered successfully',
      user: savedUser,
      accessToken,
    };
  }

  async cleanExpiredOtps(): Promise<void> {
    await this.verificationRepository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });
  }
}