import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
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
import { User } from 'src/users/entities/user.entity';
import { Transaction } from 'src/dashboard/entities/transaction.entity';
import { FundingRequest } from 'src/dashboard/entities/funding-request.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
     @InjectRepository(Transaction) private readonly transactionsRepo: Repository<Transaction>,
    @InjectRepository(FundingRequest) private readonly fundingRequestRepo: Repository<FundingRequest>,
   

  ) {}

  /** --------- Admin Login ------------ */

  async adminLogin({ email, password }: LoginDto): Promise<{
    status: string;
    message: string;
    accessToken: string;
    admin: Partial<Admin>;
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
        select: [
          'id',
          'firstName',
          'lastName',
          'email',
          'role',
          'isVerified',
          'password', // needed for validation, will strip before return
        ],
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

      // remove password before returning
      const { password: _, ...safeAdmin } = admin;

      return {
        status: 'success',
        message: 'Login successful',
        accessToken,
        admin: safeAdmin, // ✅ returns user without password
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

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

  /** --------- Admin Get All Users ------------ */
  async getAllUsers(isNew: boolean, currentUser: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this resource');
    }

    let users: User[];
    if (isNew) {
      users = await this.usersRepo.find({
        order: { createdAt: 'DESC' },
        take: 5,
      });
    } else {
      users = await this.usersRepo.find();
    }

    return {
      status_code: 200,
      status: 'success',
      data: users,
    };
  }



  /** --------- Admin Get Metrics ------------ */
   async getAdminDashboardData() {
    try {
      // 🔹 Calculate total wallet balance
      const { sum } = await this.usersRepo
        .createQueryBuilder('user')
        .select('SUM(user.walletBalance)', 'sum')
        .getRawOne();

      const totalBalance = Number(sum) || 0;

      // 🔹 Count transactions by status
      const successfulTransactions = await this.transactionsRepo.count({
        where: { status: 'success' },
      });

      const failedTransactions = await this.transactionsRepo.count({
        where: { status: 'failed' },
      });

      const pendingTransactions = await this.transactionsRepo.count({
        where: { status: 'pending' },
      });

      // 🔹 Return structured response
      return {
        totalBalance,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching admin dashboard data');
    }
  }




    /** --------- Admin Get Funding request ------------ */
     async getPendingFundingRequest() {
    try {
      const pendingRequests = await this.fundingRequestRepo.find({
        where: { status: 'pending' },
      });

      return {
        status_code: 200,
        data: pendingRequests,
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }


   /** --------- Admin Aprrove Funding request ------------ */
   async approveFundingRequest(requestId: string) {
  // 🔹 Find funding request
  const fundingRequest = await this.fundingRequestRepo.findOne({
    where: { id: requestId },
  });
  if (!fundingRequest) {
    throw new NotFoundException('Funding request not found');
  }

  // 🔹 Approve request
  fundingRequest.status = 'approved';
  await this.fundingRequestRepo.save(fundingRequest);

  // 🔹 Update user wallet
  const user = await this.usersRepo.findOne({
    where: { id: fundingRequest.userId as unknown as string }, // <-- If FundingRequest.userId is a UUID
  });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.walletBalance = Number(user.walletBalance) + Number(fundingRequest.amount);
  await this.usersRepo.save(user);

  // 🔹 Update related transaction
  await this.transactionsRepo.update(
    {
      requestId: { id: requestId },   // ✅ relation must be object
      type: 'funding_request',
    },
    { status: 'completed' },
  );

  return {
    status_code: 200,
    message: 'Funding request approved successfully',
    balance: Number(user.walletBalance),
  };
}


  

}
