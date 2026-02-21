'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Vehicle, Driver, Trip } from './types';
import { useAuth } from './auth-context';
import { useVehicles, useDrivers, useTrips, useVehicleMutations, useDriverMutations, useTripMutations } from './hooks/use-fleet-data';
import { toBackendVehicleStatus, toBackendDriverStatus, toBackendTripStatus } from './api';
import { roleDisplay } from './auth-context';

interface StoreContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  role: string;
  setRole: (r: string) => void;
  sendToShop: (id: string) => void;
  retireVehicle: (id: string) => void;
  addVehicle: (v: Omit<Vehicle, 'id' | 'status' | 'fuelEfficiency' | 'roi'>) => void;
  toggleDriverDuty: (id: string) => void;
  addTrip: (t: Omit<Trip, 'id' | 'status' | 'createdAt'>) => void;
  advanceTripStatus: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

const noop = () => {};

export function StoreProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { vehicles, isLoading: vLoading, isError: vError } = useVehicles();
  const { drivers, isLoading: dLoading, isError: dError } = useDrivers();
  const { trips, isLoading: tLoading, isError: tError } = useTrips();
  const { create: createVehicle, updateStatus: updateVehicleStatus, remove: removeVehicle } = useVehicleMutations();
  const { updateStatus: updateDriverStatus } = useDriverMutations();
  const { create: createTrip, updateStatus: updateTripStatus } = useTripMutations();

  const isLoading = vLoading || dLoading || tLoading;
  const isError = vError || dError || tError;
  const role = user ? roleDisplay(user.role) : 'Manager';

  const setRole = noop;

  const sendToShop = (id: string) => {
    updateVehicleStatus.mutate({ id, status: toBackendVehicleStatus('in_shop') });
  };

  const retireVehicle = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    const next = v?.status === 'out_of_service' ? 'available' : 'out_of_service';
    updateVehicleStatus.mutate({ id, status: toBackendVehicleStatus(next) });
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'status' | 'fuelEfficiency' | 'roi'>) => {
    createVehicle.mutate({
      name: vehicle.name,
      licensePlate: vehicle.licensePlate,
      maxCapacity: vehicle.maxLoadCapacity,
      odometer: vehicle.odometer,
      type: vehicle.type || undefined,
    });
  };

  const toggleDriverDuty = (id: string) => {
    const d = drivers.find((x) => x.id === id);
    const next = d?.status === 'active' ? 'off_duty' : 'active';
    updateDriverStatus.mutate({ id, status: toBackendDriverStatus(next) });
  };

  const addTrip = (trip: Omit<Trip, 'id' | 'status' | 'createdAt'>) => {
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    createTrip.mutate({
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      cargoWeight: trip.cargoWeight,
      revenue: 0,
      startOdo: vehicle?.odometer ?? 0,
      origin: trip.origin,
      destination: trip.destination,
      scheduledDate: trip.scheduledDate,
      distance: trip.distance,
    });
  };

  const advanceTripStatus = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    const next = trip.status === 'draft' ? 'dispatched' : 'completed';
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    updateTripStatus.mutate({
      id: tripId,
      status: toBackendTripStatus(next),
      ...(next === 'completed' && vehicle && { endOdo: vehicle.odometer + (trip.distance || 0) }),
    });
  };

  const value: StoreContextType = {
    vehicles: isAuthenticated ? vehicles : [],
    drivers: isAuthenticated ? drivers : [],
    trips: isAuthenticated ? trips : [],
    role,
    setRole,
    sendToShop: isAuthenticated ? sendToShop : noop,
    retireVehicle: isAuthenticated ? retireVehicle : noop,
    addVehicle: isAuthenticated ? addVehicle : noop,
    toggleDriverDuty: isAuthenticated ? toggleDriverDuty : noop,
    addTrip: isAuthenticated ? addTrip : noop,
    advanceTripStatus: isAuthenticated ? advanceTripStatus : noop,
    isLoading,
    isError,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
