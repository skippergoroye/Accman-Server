import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
}
