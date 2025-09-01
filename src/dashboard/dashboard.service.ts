import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { FundingRequest } from './entities/funding-request.entity';
import { Transaction } from './entities/transaction.entity';
import { JwtPayload } from './interface/authuserinterface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(FundingRequest)
    private readonly fundingRequestRepository: Repository<FundingRequest>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /***-----------Add Fund -----------**/

  async addFunds(
    userId: string,
    amount: number,
  ): Promise<{ status: string; message: string }> {
    if (!userId || !amount || amount <= 0) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid amount or user ID',
      });
    }

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException({
          status: 'error',
          message: 'User not found',
        });
      }

      const fundingRequest = this.fundingRequestRepository.create({
        userId: user,
        amount,
        status: 'pending',
      });
      await this.fundingRequestRepository.save(fundingRequest);

      const transaction = this.transactionRepository.create({
        userId: user,
        type: 'funding_request',
        amount,
        status: 'pending',
        requestId: fundingRequest,
      });
      await this.transactionRepository.save(transaction);

      return {
        status: 'success',
        message: 'Funding request submitted successfully',
      };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to process funding request',
      });
    }
  }

  /***---------- Get Transactions  -----------**/
  async getTransactionsByUserId(
    userId: string,
    authUser: JwtPayload,
  ): Promise<{ status: string; data: any[]; status_code: number }> {
    // console.log("authUser", authUser)
    try {
      // Authorization check: Ensure the authenticated user can access this userId
      if (authUser.sub !== userId) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'You are not authorized to view these transactions',
        });
      }

      const transactions = await this.transactionRepository.find({
        where: { userId: { id: userId } },
      });
      return { status: 'success', data: transactions, status_code: 200 };
    } catch (error) {
      console.log(error);
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to retrieve transactions',
      });
    }
  }
}
