import { Test, TestingModule } from '@nestjs/testing';
import { AppoimentsService } from './appoiments.service';

describe('AppoimentsService', () => {
  let service: AppoimentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppoimentsService],
    }).compile();

    service = module.get<AppoimentsService>(AppoimentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
