import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity('funding_requests')
export class FundingRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  userId: User;


  @ManyToOne(() => User, (user) => user.fundingRequests, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;   // 👈 add this

  @Column({ type: 'decimal', nullable: false })
  amount: number;

  @Column({
    type: 'varchar',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}