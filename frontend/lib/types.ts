export type VehicleStatus = 'available' | 'on_trip' | 'in_shop' | 'out_of_service';
export type DriverStatus = 'active' | 'off_duty' | 'on_trip';
export type TripStatus = 'draft' | 'dispatched' | 'completed';
export type UserRole = 'Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  maxLoadCapacity: number;
  odometer: number;
  status: VehicleStatus;
  type: string;
  fuelEfficiency: number;
  roi: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: DriverStatus;
  tripsCompleted: number;
  phone: string;
  avatar: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  cargoWeight: number;
  status: TripStatus;
  createdAt: string;
  scheduledDate: string;
  distance: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}