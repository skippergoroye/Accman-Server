import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccoutSettingsService } from './accout-settings.service';
import { CreateAccoutSettingDto } from './dto/create-accout-setting.dto';
import { UpdateAccoutSettingDto } from './dto/update-accout-setting.dto';

@Controller('accout-settings')
export class AccoutSettingsController {
  constructor(private readonly accoutSettingsService: AccoutSettingsService) {}

  @Post()
  create(@Body() createAccoutSettingDto: CreateAccoutSettingDto) {
    return this.accoutSettingsService.create(createAccoutSettingDto);
  }

  @Get()
  findAll() {
    return this.accoutSettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accoutSettingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccoutSettingDto: UpdateAccoutSettingDto) {
    return this.accoutSettingsService.update(+id, updateAccoutSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accoutSettingsService.remove(+id);
  }
}
