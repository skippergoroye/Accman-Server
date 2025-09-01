import { Module } from '@nestjs/common';
import { AccoutSettingsService } from './accout-settings.service';
import { AccoutSettingsController } from './accout-settings.controller';

@Module({
  controllers: [AccoutSettingsController],
  providers: [AccoutSettingsService],
})
export class AccoutSettingsModule {}
