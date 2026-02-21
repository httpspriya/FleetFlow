import { Test, TestingModule } from '@nestjs/testing';
import { DriverService } from './driver.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { DriverStatus } from '../../core/prisma/enums';

const mockPrisma = {
  driver: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DriverService', () => {
  let service: DriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DriverService>(DriverService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all drivers', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if driver not found', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update driver status', async () => {
      const driver = { id: '1', status: DriverStatus.OnDuty };
      mockPrisma.driver.findUnique.mockResolvedValue(driver);
      mockPrisma.driver.update.mockResolvedValue({ ...driver, status: DriverStatus.Suspended });
      const result = await service.updateStatus('1', DriverStatus.Suspended);
      expect(result.status).toBe(DriverStatus.Suspended);
    });
  });
});
