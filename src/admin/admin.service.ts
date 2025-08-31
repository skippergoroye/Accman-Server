// import {
//   Injectable,
//   BadRequestException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
// import { Admin } from './entities/admin.entity';
// import { LoginDto } from 'src/auth/dto/login.dto';

// @Injectable()
// export class AdminService {
//   constructor(
//     @InjectRepository(Admin)
//     private readonly adminRepository: Repository<Admin>,
//     private readonly jwtService: JwtService,
//   ) {}

//   async adminLogin(
//     { email, password }: LoginDto,
//   ): Promise<{ status: string; message: string; accessToken: string }> {
//     const sanitizedEmail = email?.trim().toLowerCase();
//     const sanitizedPassword = password?.trim();

//     if (!sanitizedEmail || !sanitizedPassword) {
//       throw new BadRequestException({
//         status: 'error',
//         message: 'Invalid email or password',
//       });
//     }

//     let admin: Admin | null;
//     try {
//       admin = await this.adminRepository.findOne({
//         where: { email: sanitizedEmail },
//         select: ['id', 'password', 'role', 'isVerified'],
//       });
//     } catch {
//       throw new InternalServerErrorException({
//         status: 'error',
//         message: 'Unable to retrieve admin',
//       });
//     }

//     if (!admin || !(await bcrypt.compare(sanitizedPassword, admin.password))) {
//       throw new BadRequestException({
//         status: 'error',
//         message: 'Invalid email or password',
//       });
//     }

//     if (!admin.isVerified) {
//       throw new BadRequestException({
//         status: 'error',
//         message: 'Account has not been verified',
//       });
//     }

//     const accessToken = this.jwtService.sign({
//       sub: admin.id,
//       role: admin.role ?? 'admin',
//     });

//     return {
//       status: 'success',
//       message: 'Login successful',
//       accessToken,
//     };
//   }
// }

import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { Verification } from 'src/auth/entities/verification.entity';
import { EmailService } from 'src/email/email.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /** --------- Admin Login ------------ */

  async adminLogin({ email, password }: LoginDto): Promise<{
    status: string;
    message: string;
    accessToken: string;
  }> {
    try {
      const sanitizedEmail = email?.trim().toLowerCase();
      const sanitizedPassword = password?.trim();

      if (!sanitizedEmail || !sanitizedPassword) {
        throw new BadRequestException({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      const admin = await this.adminRepository.findOne({
        where: { email: sanitizedEmail },
        select: ['id', 'password', 'role', 'isVerified'],
      });

      if (
        !admin ||
        !(await bcrypt.compare(sanitizedPassword, admin.password))
      ) {
        throw new BadRequestException({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      if (!admin.isVerified) {
        throw new BadRequestException({
          status: 'error',
          message: 'Account has not been verified',
        });
      }

      const accessToken = this.jwtService.sign({
        sub: admin.id,
        role: admin.role ?? 'admin',
      });

      return {
        status: 'success',
        message: 'Login successful',
        accessToken,
      };
    } catch (error) {
      // if it's already a known NestJS HttpException, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }

      // otherwise wrap in InternalServerErrorException
      throw new InternalServerErrorException({
        status: 'error',
        message: error?.message || 'Something went wrong during login',
      });
    }
  }

  /** --------- Admin Register ------------ */

  async adminRegister(registerDto: RegisterDto): Promise<{
    status: string;
    message: string;
    user: Partial<Admin>;
    accessToken: string;
  }> {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
    } = registerDto;
    const sanitizedEmail = email.trim().toLowerCase();

    if (!sanitizedEmail || !password?.trim()) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    if (password !== confirmPassword) {
      throw new BadRequestException({
        status: 'error',
        message: 'Password and confirm password do not match',
      });
    }

    try {
      // Check if admin exists
      const adminExists = await this.adminRepository.findOne({
        where: { email: sanitizedEmail },
      });
      if (adminExists) {
        throw new BadRequestException({
          status: 'error',
          message: 'Admin already exists',
        });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Send verification email
      await this.emailService.sendVerificationEmail(sanitizedEmail, otp);

      // Hash password
      const hash = await bcrypt.hash(password, 10);

      // Create and save admin
      const newAdmin = this.adminRepository.create({
        email: sanitizedEmail,
        password: hash,
        firstName,
        lastName,
        phoneNumber,
        isVerified: false,
        role: 'admin',
      });
      const savedAdmin = await this.adminRepository.save(newAdmin);

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
        sub: savedAdmin.id,
        role: savedAdmin.role || 'admin',
      });

      const {
        password: _,
        resetToken: __,
        resetTokenExpires: ___,
        ...adminWithoutSensitive
      } = savedAdmin;

      return {
        status: 'success',
        message: 'Admin registered successfully. Verification email sent.',
        user: adminWithoutSensitive,
        accessToken,
      };
    } catch (error) {
       console.error(error); 
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to register admin',
      });
    }
  }
}
