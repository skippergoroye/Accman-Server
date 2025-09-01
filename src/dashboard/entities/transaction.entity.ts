import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { FundingRequest } from './funding-request.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  userId: User;

  @Column({
    type: 'varchar',
    enum: ['funding_request', 'withdrawal'],
    nullable: false,
  })
  type: string;

  @Column({ type: 'decimal', nullable: false })
  amount: number;

  @Column({
    type: 'varchar',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @ManyToOne(() => FundingRequest, (request) => request.id)
  @JoinColumn({ name: 'requestId' })
  requestId: FundingRequest;

  @CreateDateColumn()
  createdAt: Date;
}
