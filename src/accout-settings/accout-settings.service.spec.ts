import { Test, TestingModule } from '@nestjs/testing';
import { AccoutSettingsService } from './accout-settings.service';

describe('AccoutSettingsService', () => {
  let service: AccoutSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccoutSettingsService],
    }).compile();

    service = module.get<AccoutSettingsService>(AccoutSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
