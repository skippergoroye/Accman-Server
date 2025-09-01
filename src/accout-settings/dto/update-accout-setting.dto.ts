import { PartialType } from '@nestjs/mapped-types';
import { CreateAccoutSettingDto } from './create-accout-setting.dto';

export class UpdateAccoutSettingDto extends PartialType(CreateAccoutSettingDto) {}
