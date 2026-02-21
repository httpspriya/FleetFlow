import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { VehicleStatus } from '../../core/prisma/enums';

const mockPrisma = {
  vehicle: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('VehicleService', () => {
  let service: VehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      mockPrisma.vehicle.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if vehicle not found', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update vehicle status', async () => {
      const vehicle = { id: '1', status: VehicleStatus.Available };
      mockPrisma.vehicle.findUnique.mockResolvedValue(vehicle);
      mockPrisma.vehicle.update.mockResolvedValue({ ...vehicle, status: VehicleStatus.OnTrip });
      const result = await service.updateStatus('1', VehicleStatus.OnTrip);
      expect(result.status).toBe(VehicleStatus.OnTrip);
    });
  });
});
