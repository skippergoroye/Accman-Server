import { Test, TestingModule } from '@nestjs/testing';
import { AccoutSettingsController } from './accout-settings.controller';
import { AccoutSettingsService } from './accout-settings.service';

describe('AccoutSettingsController', () => {
  let controller: AccoutSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccoutSettingsController],
      providers: [AccoutSettingsService],
    }).compile();

    controller = module.get<AccoutSettingsController>(AccoutSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
