import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    describe('PrismaService', () => {
      let service: PrismaService;

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [PrismaService],
        }).compile();

        service = module.get<PrismaService>(PrismaService);
      });

      afterEach(async () => {
        await service.$disconnect();
      });

      it('should be defined', () => {
        expect(service).toBeDefined();
      });

      it('should extend PrismaClient', () => {
        expect(service).toBeInstanceOf(PrismaService);
      });

      it('should connect to database on module init', async () => {
        const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

        await service.onModuleInit();

        expect(connectSpy).toHaveBeenCalledTimes(1);
        connectSpy.mockRestore();
      });

      it('should have onModuleInit method', () => {
        expect(typeof service.onModuleInit).toBe('function');
      });
    });
  });

  afterEach(async () => {
    await service.$disconnect();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service).toBeInstanceOf(PrismaService);
  });
  it('should connect to database on module init', async () => {
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
    connectSpy.mockRestore();
  });

  it('should have onModuleInit method', () => {
    expect(typeof service.onModuleInit).toBe('function');
  });
});
