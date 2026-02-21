const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const AUTH_LOGOUT_EVENT = 'auth:logout';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function clearSessionAndNotify(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSessionAndNotify();
    if (typeof window !== 'undefined') window.location.href = '/auth';
    const err = await res.json().catch(() => ({ message: 'Unauthorized' }));
    throw new Error((err as { message?: string }).message || 'Session expired. Please sign in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const authApi = {
  register: (body: { email: string; password: string; role: string }) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    api<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => api<{ id: string; email: string; role: string }>('/auth/me'),
};

// Vehicles
export const vehiclesApi = {
  list: () => api<any[]>('/vehicles'),
  get: (id: string) => api<any>(`/vehicles/${id}`),
  create: (body: { name: string; licensePlate: string; maxCapacity: number; odometer: number; acquisitionCost?: number; type?: string }) =>
    api<any>('/vehicles', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<{ name: string; maxCapacity: number; odometer: number; type: string }>) =>
    api<any>(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateStatus: (id: string, status: string) =>
    api<any>(`/vehicles/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string) => api<void>(`/vehicles/${id}`, { method: 'DELETE' }),
};

// Drivers
export const driversApi = {
  list: () => api<any[]>('/drivers'),
  get: (id: string) => api<any>(`/drivers/${id}`),
  create: (body: { name: string; licenseNumber?: string; licenseExpiry: string; safetyScore?: number }) =>
    api<any>('/drivers', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<{ name: string; licenseNumber: string; licenseExpiry: string; safetyScore: number }>) =>
    api<any>(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateStatus: (id: string, status: string) =>
    api<any>(`/drivers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string) => api<void>(`/drivers/${id}`, { method: 'DELETE' }),
};

// Trips
export const tripsApi = {
  list: () => api<any[]>('/trips'),
  get: (id: string) => api<any>(`/trips/${id}`),
  create: (body: {
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    revenue: number;
    startOdo: number;
    endOdo?: number;
    origin?: string;
    destination?: string;
    scheduledDate?: string;
    distance?: number;
  }) => api<any>('/trips', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: string, body: { status: string; endOdo?: number }) =>
    api<any>(`/trips/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => api<void>(`/trips/${id}`, { method: 'DELETE' }),
};

// Analytics
export const analyticsApi = {
  fuelEfficiency: () => api<any[]>('/analytics/fuel-efficiency'),
  roi: () => api<any[]>('/analytics/roi'),
  driverSafety: () => api<any[]>('/analytics/driver-safety'),
  fleetSummary: () => api<any>('/analytics/fleet-summary'),
};

// Maintenance
export const maintenanceApi = {
  list: () => api<any[]>('/maintenance'),
  create: (body: { vehicleId: string; cost: number; issue?: string; serviceDate?: string }) =>
    api<any>('/maintenance', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { cost?: number; issue?: string; serviceDate?: string }) =>
    api<any>(`/maintenance/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => api<void>(`/maintenance/${id}`, { method: 'DELETE' }),
};

// Expenses
export const expensesApi = {
  list: () => api<any[]>('/expenses'),
  create: (body: { vehicleId: string; amount: number }) =>
    api<any>('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { amount: number }) =>
    api<any>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => api<void>(`/expenses/${id}`, { method: 'DELETE' }),
};

// Map backend enum to frontend
export const mapVehicleStatus = (s: string) =>
  ({ Available: 'available', OnTrip: 'on_trip', InShop: 'in_shop', Retired: 'out_of_service' }[s] ?? s?.toLowerCase() ?? 'available');
export const mapDriverStatus = (s: string) =>
  ({ OnDuty: 'active', OffDuty: 'off_duty', Suspended: 'suspended' }[s] ?? s?.toLowerCase() ?? 'off_duty');
export const mapTripStatus = (s: string) =>
  ({ Draft: 'draft', Dispatched: 'dispatched', Completed: 'completed', Cancelled: 'cancelled' }[s] ?? s?.toLowerCase() ?? 'draft');

// Map frontend status to backend enum
export const toBackendVehicleStatus = (s: string) =>
  ({ available: 'Available', on_trip: 'OnTrip', in_shop: 'InShop', out_of_service: 'Retired' }[s] ?? 'Available');
export const toBackendDriverStatus = (s: string) =>
  ({ active: 'OnDuty', off_duty: 'OffDuty', on_trip: 'OnDuty', suspended: 'Suspended' }[s] ?? 'OffDuty');
export const toBackendTripStatus = (s: string) =>
  ({ draft: 'Draft', dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled' }[s] ?? 'Draft');
