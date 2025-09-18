import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        status_code: 404,
        status: 'error',
        error: 'User not found',
      });
    }

    // Exclude password
    const { password, ...others } = user;
    return {
      status_code: 200,
      status: 'success',
      data: others,
    };
  }
}
