import { Controller, Get, Param, UseGuards, Body, UseInterceptors, UploadedFile, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';


@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  /** get SIngle User */
  @Get('find/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }



  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateUser(id, updateUserDto, file);
  }
}
