import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { FundingRequest } from './entities/funding-request.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(FundingRequest) private readonly fundingRequestRepository: Repository<FundingRequest>,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async addFunds(userId: string, amount: number): Promise<{ status: string; message: string }> {
    if (!userId || !amount || amount <= 0) {
      throw new BadRequestException({ status: 'error', message: 'Invalid amount or user ID' });
    }

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException({ status: 'error', message: 'User not found' });
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

      return { status: 'success', message: 'Funding request submitted successfully' };
    } catch (error) {
      console.log(error)
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({ status: 'error', message: 'Failed to process funding request' });
    }
  }
}