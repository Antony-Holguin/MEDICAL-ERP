import { Test, TestingModule } from '@nestjs/testing';
import { RolController } from '../controller/rol.controller';
import { RolService } from '../service/rol.service';

describe('RolController', () => {
  let controller: RolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolController],
      providers: [RolService],
    }).compile();

    controller = module.get<RolController>(RolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
