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
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
// import { config } from 'dotenv';
// config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /** --------- Register user --------******/

  async register(registerDto: RegisterDto): Promise<{
    status: string;
    message: string;
    user?: Partial<User>;
    accessToken?: string;
  }> {
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

    // Generate OTP first (before creating user)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Try sending verification email first
    try {
      await this.emailService.sendVerificationEmail(sanitizedEmail, otp);
    } catch {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to send verification email',
      });
    }

    // Hash password only after email success
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = this.userRepository.create({
      firstName,
      lastName,
      email: sanitizedEmail,
      password: hash,
      phoneNumber,
      isVerified: false,
      walletBalance: 0,
    });

    const savedUser: User = await this.userRepository.save(newUser);

    // Save OTP
    await this.verificationRepository.save(
      this.verificationRepository.create({
        email: sanitizedEmail,
        otp,
        expiresAt,
      }),
    );

    // Generate JWT
    const accessToken = this.jwtService.sign({
      sub: savedUser.id,
      role: savedUser.role,
    });

    // ✅ Remove password before returning
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      status: 'success',
      message: 'User registered successfully',
      user: userWithoutPassword,
      accessToken,
    };
  }

  /** --------- Verify user --------******/

  async verifyEmail({
    email,
    otp,
  }: VerifyEmailDto): Promise<{ status: string; message: string }> {
    const sanitizedEmail = email.trim().toLowerCase();
    const verification = await this.verificationRepository.findOne({
      where: { email: sanitizedEmail, otp },
    });
    if (!verification) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid or expired OTP',
      });
    }
    if (verification.expiresAt < new Date()) {
      await this.verificationRepository.delete({ email: sanitizedEmail });
      throw new BadRequestException({
        status: 'error',
        message: 'OTP has expired',
      });
    }
    const user = await this.userRepository.findOne({
      where: { email: sanitizedEmail },
    });
    if (!user) {
      throw new BadRequestException({
        status: 'error',
        message: 'User not found',
      });
    }
    user.isVerified = true;
    await this.userRepository.save(user);
    await this.verificationRepository.delete({ email: sanitizedEmail });
    return {
      status: 'success',
      message: 'Email verified successfully',
    };
  }

  async cleanExpiredOtps(): Promise<void> {
    await this.verificationRepository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });
  }

  /** --------- Login user --------******/

  async login(loginDto: LoginDto): Promise<{
    status: string;
    message: string;
    user: Partial<User>;
    accessToken: string;
  }> {
    const { email, password } = loginDto;
    const sanitizedEmail = email.trim().toLowerCase();

    // Validate input
    if (!sanitizedEmail || !password?.trim()) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Find user
    let user: User | null;
    try {
      user = await this.userRepository.findOne({
        where: { email: sanitizedEmail },
        select: [
          'id',
          'email',
          'password',
          'firstName',
          'lastName',
          'phoneNumber',
          'role',
          'isVerified',
          'walletBalance',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to retrieve user',
      });
    }

    if (!user) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new BadRequestException({
        status: 'error',
        message: 'Please verify your email before logging in',
      });
    }

    // Generate JWT
    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      status: 'success',
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
    };
  }

  /** --------- Forgot password --------******/

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ status: string; message: string }> {
    const { email } = forgotPasswordDto;
    const sanitizedEmail = email.trim().toLowerCase();

    // Validate input
    if (!sanitizedEmail) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid email',
      });
    }

    // Find user
    let user: User | null;
    try {
      user = await this.userRepository.findOne({
        where: { email: sanitizedEmail },
      });
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to retrieve user',
      });
    }

    if (!user) {
      throw new BadRequestException({
        status: 'error',
        message: 'User not found',
      });
    }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = resetCode;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.userRepository.save(user);
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    const resetLink = `${clientUrl}/reset-new-password/${resetCode}`;

    try {
      await this.emailService.sendForgotPasswordMail(sanitizedEmail, resetLink);
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to send password reset email',
      });
    }

    return {
      status: 'success',
      message: 'Password reset link sent successfully',
    };
  }

  /** --------- Reset password --------******/

  // async resetPassword(
  //   resetPasswordDto: ResetPasswordDto,
  // ): Promise<{ status: string; message: string }> {
  //   const { email, resetCode, newPassword } = resetPasswordDto;
  //   const sanitizedEmail = email.trim().toLowerCase();

  //   // Validate input
  //   if (!sanitizedEmail || !resetCode?.trim() || !newPassword?.trim()) {
  //     throw new BadRequestException({
  //       status: 'error',
  //       message: 'Invalid email, reset code, or new password',
  //     });
  //   }

  //   // Find user
  //   let user: User | null;
  //   try {
  //     user = await this.userRepository.findOne({
  //       where: { email: sanitizedEmail, resetToken: resetCode },
  //     });
  //   } catch (error) {
  //     throw new InternalServerErrorException({
  //       status: 'error',
  //       message: 'Failed to retrieve user',
  //     });
  //   }

  //   if (!user || user.resetTokenExpires < new Date()) {
  //     throw new BadRequestException({
  //       status: 'error',
  //       message: 'Invalid or expired reset code',
  //     });
  //   }

  //   // Hash new password
  //   let hash: string;
  //   try {
  //     hash = await bcrypt.hash(newPassword, 10);
  //   } catch (error) {
  //     throw new InternalServerErrorException({
  //       status: 'error',
  //       message: 'Failed to hash password',
  //     });
  //   }

  //   // Update user
  //   user.password = hash;
  //   user.resetToken = null;
  //   user.resetTokenExpires = null;

  //   try {
  //     await this.userRepository.save(user);
  //   } catch (error) {
  //     throw new InternalServerErrorException({
  //       status: 'error',
  //       message: 'Failed to reset password',
  //     });
  //   }

  //   return {
  //     status: 'success',
  //     message: 'Password reset successfully',
  //   };
  // }

  /** --------- Reset password --------******/

  async resetPassword(
    resetCode: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ status: string; message: string }> {
    const { email, newPassword } = resetPasswordDto;
    const sanitizedEmail = email.trim().toLowerCase();

    // Validate input
    if (!sanitizedEmail || !resetCode?.trim() || !newPassword?.trim()) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid email, reset code, or new password',
      });
    }

    // Find user
    let user: User | null;
    try {
      user = await this.userRepository.findOne({
        where: { email: sanitizedEmail, resetToken: resetCode },
      });
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to retrieve user',
      });
    }

    // ✅ Guard against undefined expiration
    if (
      !user ||
      !user.resetTokenExpires ||
      user.resetTokenExpires < new Date()
    ) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid or expired reset code',
      });
    }

    // Hash new password
    let hash: string;
    try {
      hash = await bcrypt.hash(newPassword, 10);
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to hash password',
      });
    }

    // Update user
    user.password = hash;
    user.resetToken = undefined; // ✅ use undefined instead of null
    user.resetTokenExpires = undefined; // ✅ use undefined instead of null

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to reset password',
      });
    }

    return {
      status: 'success',
      message: 'Password reset successfully',
    };
  }
}
