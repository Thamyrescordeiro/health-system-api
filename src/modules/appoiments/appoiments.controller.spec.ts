import { Test, TestingModule } from '@nestjs/testing';
import { AppoimentsController } from './appoiments.controller';

describe('AppoimentsController', () => {
  let controller: AppoimentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppoimentsController],
    }).compile();

    controller = module.get<AppoimentsController>(AppoimentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
