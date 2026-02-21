import { Test, TestingModule } from '@nestjs/testing';
import { TripService } from './trip.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TripStatus, VehicleStatus, DriverStatus } from '../../core/prisma/enums';

const mockPrisma = {
  trip: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  vehicle: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  driver: {
    findUnique: jest.fn(),
  },
};

describe('TripService', () => {
  let service: TripService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TripService>(TripService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if vehicle is not available', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ status: VehicleStatus.OnTrip });
      await expect(
        service.create({ vehicleId: 'v1', driverId: 'd1', cargoWeight: 100, revenue: 500, startOdo: 1000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if driver is not on duty', async () => {
      mockPrisma.vehicle.findUnique.mockResolvedValue({ status: VehicleStatus.Available });
      mockPrisma.driver.findUnique.mockResolvedValue({ status: DriverStatus.Suspended });
      await expect(
        service.create({ vehicleId: 'v1', driverId: 'd1', cargoWeight: 100, revenue: 500, startOdo: 1000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should throw on invalid transition', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        id: '1', status: TripStatus.Completed, vehicleId: 'v1', startOdo: 1000, endOdo: 1200,
        vehicle: {}, driver: {},
      });
      await expect(
        service.updateStatus('1', { status: TripStatus.Dispatched }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if completing without endOdo', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue({
        id: '1', status: TripStatus.Dispatched, vehicleId: 'v1', startOdo: 1000, endOdo: null,
        vehicle: {}, driver: {},
      });
      await expect(
        service.updateStatus('1', { status: TripStatus.Completed }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if trip not found', async () => {
      mockPrisma.trip.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
