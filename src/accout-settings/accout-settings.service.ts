import { Injectable } from '@nestjs/common';
import { CreateAccoutSettingDto } from './dto/create-accout-setting.dto';
import { UpdateAccoutSettingDto } from './dto/update-accout-setting.dto';

@Injectable()
export class AccoutSettingsService {
  create(createAccoutSettingDto: CreateAccoutSettingDto) {
    return 'This action adds a new accoutSetting';
  }

  findAll() {
    return `This action returns all accoutSettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accoutSetting`;
  }

  update(id: number, updateAccoutSettingDto: UpdateAccoutSettingDto) {
    return `This action updates a #${id} accoutSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} accoutSetting`;
  }
}
