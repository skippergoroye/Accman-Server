import { Exclude } from 'class-transformer';
import { FundingRequest } from 'src/dashboard/entities/funding-request.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => FundingRequest, (request) => request.user)
 fundingRequests: FundingRequest[];


  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  img?: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires?: Date;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({
    type: 'decimal',
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number | null) => (value == null ? 0 : Number(value)),
    },
  })
  walletBalance: number;

  @Column({ type: 'boolean', default: false })
  blocked: boolean;
}
