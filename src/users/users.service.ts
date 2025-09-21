import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { v2 as cloudinary } from 'cloudinary';
import { FileInterceptor } from '@nestjs/platform-express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}


  /** Find User **/
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

  /** Update User **/
  async updateUser(id: string, dto: UpdateUserDto, file?: Express.Multer.File) {
    const user = await this.usersRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException({
        status_code: 404,
        status: 'error',
        error: 'User not found',
      });
    }

    // Update fields
    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.phoneNumber) user.phoneNumber = dto.phoneNumber;
    if (dto.gender) user.gender = dto.gender;

    // Handle image upload
    if (file) {
      try {
        const result = await cloudinary.uploader.upload(file.path);
        user.img = result.secure_url;
      } catch (err) {
        throw new BadRequestException({
          status_code: 400,
          status: 'error',
          error: 'Image upload failed',
        });
      }
    }

    const savedUser = await this.usersRepo.save(user);

    return {
      status_code: 200,
      status: 'success',
      message: 'User updated successfully',
      data: { user: savedUser },
    };
  }



  /** Delete User **/
  async deleteUser(id: string, currentUser: any) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        status_code: 404,
        status: 'error',
        error: 'User not found',
      });
    }

    // Admin → hard delete
    if (currentUser.role === 'admin') {
      await this.usersRepo.remove(user);
      return {
        status_code: 200,
        status: 'success',
        message: 'User has been hard deleted',
      };
    }

    // Self → soft delete
    if (currentUser.sub === id || currentUser.id === id) {
      user.deletedAt = new Date();
      await this.usersRepo.save(user);

      return {
        status_code: 200,
        status: 'success',
        message: 'User has been soft deleted',
      };
    }

    // Unauthorized
    throw new ForbiddenException({
      status_code: 403,
      status: 'error',
      error: 'Unauthorized to delete other users',
    });
  }


    /** Get User balance **/
    async getUserBalance(userId: string): Promise<number> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.walletBalance;
  }
}
