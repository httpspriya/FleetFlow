'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  vehiclesApi,
  driversApi,
  tripsApi,
  analyticsApi,
  maintenanceApi,
  expensesApi,
  mapVehicleStatus,
  mapDriverStatus,
  mapTripStatus,
} from '../api';
import { useAuth } from '../auth-context';
import type { Vehicle, Driver, Trip } from '../types';

function toVehicle(r: any): Vehicle {
  return {
    id: r.id,
    name: r.name,
    licensePlate: r.licensePlate,
    maxLoadCapacity: r.maxCapacity,
    odometer: r.odometer,
    status: mapVehicleStatus(r.status),
    type: r.type || '—',
    fuelEfficiency: r.fuelEfficiency ?? 0,
    roi: r.roi ?? 0,
  };
}

function toDriver(r: any, index: number): Driver & { completionRate?: number; complaints?: number } {
  const initials = r.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
  return {
    id: r.id,
    name: r.name,
    licenseNumber: r.licenseNumber || r.id,
    licenseExpiry: typeof r.licenseExpiry === 'string' ? r.licenseExpiry.slice(0, 10) : new Date(r.licenseExpiry).toISOString().slice(0, 10),
    status: mapDriverStatus(r.status),
    tripsCompleted: Array.isArray(r.trips) ? r.trips.filter((t: any) => t.status === 'Completed').length : 0,
    phone: '',
    avatar: initials,
    completionRate: r.safetyScore ?? 80,
    complaints: 0,
  };
}

function toTrip(r: any): Trip {
  return {
    id: r.id,
    vehicleId: r.vehicleId,
    driverId: r.driverId,
    origin: r.origin || '—',
    destination: r.destination || '—',
    cargoWeight: r.cargoWeight,
    status: mapTripStatus(r.status),
    createdAt: r.createdAt?.slice?.(0, 10) || new Date().toISOString().slice(0, 10),
    scheduledDate: r.scheduledDate ? new Date(r.scheduledDate).toISOString().slice(0, 10) : '—',
    distance: r.distance ?? (r.endOdo != null && r.startOdo != null ? r.endOdo - r.startOdo : 0),
  };
}

export function useVehicles() {
  const { isAuthenticated } = useAuth();
  const q = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.list(),
    select: (data) => (Array.isArray(data) ? data.map(toVehicle) : []),
    enabled: isAuthenticated,
  });
  return { vehicles: q.data ?? [], ...q };
}

export function useDrivers() {
  const { isAuthenticated } = useAuth();
  const q = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversApi.list(),
    select: (data) => (Array.isArray(data) ? data.map((d, i) => toDriver(d, i)) : []),
    enabled: isAuthenticated,
  });
  return { drivers: q.data ?? [], ...q };
}

export function useTrips() {
  const { isAuthenticated } = useAuth();
  const q = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsApi.list(),
    select: (data) => (Array.isArray(data) ? data.map(toTrip) : []),
    enabled: isAuthenticated,
  });
  return { trips: q.data ?? [], ...q };
}

export function useAnalyticsFuel() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'fuel'],
    queryFn: () => analyticsApi.fuelEfficiency(),
    enabled: isAuthenticated,
  });
}

export function useAnalyticsRoi() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'roi'],
    queryFn: () => analyticsApi.roi(),
    enabled: isAuthenticated,
  });
}

export function useFleetSummary() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'fleet-summary'],
    queryFn: () => analyticsApi.fleetSummary(),
    enabled: isAuthenticated,
  });
}

export function useMaintenanceLogs() {
  const { isAuthenticated } = useAuth();
  const q = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.list(),
    enabled: isAuthenticated,
  });
  return { logs: q.data ?? [], ...q };
}

export function useExpenses() {
  const { isAuthenticated } = useAuth();
  const q = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesApi.list(),
    enabled: isAuthenticated,
  });
  return { expenses: q.data ?? [], ...q };
}

export function useVehicleMutations() {
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: (body: { name: string; licensePlate: string; maxCapacity: number; odometer: number; type?: string }) =>
      vehiclesApi.create({ ...body, acquisitionCost: 0 }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['vehicles'] }),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => vehiclesApi.updateStatus(id, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['vehicles'] });
      client.invalidateQueries({ queryKey: ['trips'] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['vehicles'] }),
  });
  return { create, updateStatus, remove };
}

export function useDriverMutations() {
  const client = useQueryClient();
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => driversApi.updateStatus(id, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['drivers'] });
      client.invalidateQueries({ queryKey: ['trips'] });
    },
  });
  return { updateStatus };
}

export function useTripMutations() {
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: (body: {
      vehicleId: string;
      driverId: string;
      cargoWeight: number;
      revenue: number;
      startOdo: number;
      origin?: string;
      destination?: string;
      scheduledDate?: string;
      distance?: number;
    }) => tripsApi.create(body),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['trips'] });
      client.invalidateQueries({ queryKey: ['vehicles'] });
      client.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status, endOdo }: { id: string; status: string; endOdo?: number }) =>
      tripsApi.updateStatus(id, { status, endOdo }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['trips'] });
      client.invalidateQueries({ queryKey: ['vehicles'] });
      client.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
  return { create, updateStatus };
}

export function useMaintenanceMutations() {
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: (body: { vehicleId: string; cost: number; issue?: string; serviceDate?: string }) =>
      maintenanceApi.create(body),
    onSuccess: () => client.invalidateQueries({ queryKey: ['maintenance'] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => maintenanceApi.delete(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['maintenance'] }),
  });
  return { create, remove };
}

export function useExpenseMutations() {
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: (body: { vehicleId: string; amount: number }) => expensesApi.create(body),
    onSuccess: () => client.invalidateQueries({ queryKey: ['expenses'] }),
  });
  return { create };
}
