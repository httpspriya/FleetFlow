'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';

// ── Status Pill ───────────────────────────────────────────────
const Pill = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    draft:      { bg: '#EDDCC6', color: '#8B5E52', label: 'Draft' },
    dispatched: { bg: '#BF4646', color: '#fff',    label: 'Dispatched' },
    completed:  { bg: '#7EACB5', color: '#fff',    label: 'Completed' },
  };
  const s = map[status] || { bg: '#eee', color: '#333', label: status };
  return <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{s.label}</span>;
};

// ── Progress Stepper ──────────────────────────────────────────
const Stepper = ({ status }: { status: string }) => {
  const steps = ['draft', 'dispatched', 'completed'];
  const idx = steps.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= idx ? '#BF4646' : '#EDDCC6', color: i <= idx ? '#fff' : '#8B5E52', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
              {i < idx ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, color: i <= idx ? '#BF4646' : '#8B5E52', whiteSpace: 'nowrap' as const }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 36, height: 2, background: i < idx ? '#BF4646' : '#EDDCC6', marginBottom: 16 }} />}
        </div>
      ))}
    </div>
  );
};

// ── Field helpers ─────────────────────────────────────────────
const onlyLettersSpacesComma = (v: string) => v.replace(/[^a-zA-Z\s,\.]/g, '');
const onlyPositiveInt         = (v: string) => v.replace(/[^0-9]/g, '');

type FieldErr = Partial<Record<keyof TripForm, string>>;

interface TripForm {
  vehicleId:    string;
  driverId:     string;
  origin:       string;
  destination:  string;
  cargoWeight:  string;
  distance:     string;
  scheduledDate:string;
}
const emptyTrip: TripForm = { vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', distance: '', scheduledDate: '' };

// Field order — each unlocks only when previous is valid
const TRIP_FIELD_ORDER: (keyof TripForm)[] = ['vehicleId', 'driverId', 'origin', 'destination', 'cargoWeight', 'distance', 'scheduledDate'];

// ── Validate ──────────────────────────────────────────────────
function validateTripForm(f: TripForm, maxCapacity: number | null): FieldErr {
  const e: FieldErr = {};

  if (!f.vehicleId)
    e.vehicleId = 'Please select a vehicle.';

  if (!f.driverId)
    e.driverId = 'Please select a driver.';

  if (!f.origin.trim())
    e.origin = 'Origin city is required.';
  else if (!/^[a-zA-Z\s,\.]+$/.test(f.origin.trim()))
    e.origin = 'Origin must contain only letters (no digits or symbols).';

  if (!f.destination.trim())
    e.destination = 'Destination city is required.';
  else if (!/^[a-zA-Z\s,\.]+$/.test(f.destination.trim()))
    e.destination = 'Destination must contain only letters (no digits or symbols).';
  else if (f.destination.trim().toLowerCase() === f.origin.trim().toLowerCase())
    e.destination = 'Destination must differ from origin.';

  if (!f.cargoWeight)
    e.cargoWeight = 'Cargo weight is required.';
  else if (Number(f.cargoWeight) <= 0)
    e.cargoWeight = 'Cargo weight must be greater than 0.';
  else if (maxCapacity !== null && Number(f.cargoWeight) > maxCapacity)
    e.cargoWeight = `⛔ Exceeds vehicle max capacity of ${maxCapacity.toLocaleString()} kg. Trip blocked.`;

  if (!f.distance)
    e.distance = 'Distance is required.';
  else if (Number(f.distance) <= 0)
    e.distance = 'Distance must be greater than 0 km.';
  else if (Number(f.distance) > 20000)
    e.distance = 'Distance seems too high (max 20,000 km).';

  if (!f.scheduledDate)
    e.scheduledDate = 'Scheduled date is required.';
  else if (new Date(f.scheduledDate) < new Date(new Date().toDateString()))
    e.scheduledDate = 'Date cannot be in the past.';

  return e;
}

function firstInvalidIndex(f: TripForm, errors: FieldErr) {
  for (let i = 0; i < TRIP_FIELD_ORDER.length; i++) {
    const k = TRIP_FIELD_ORDER[i];
    if (!f[k] || errors[k]) return i;
  }
  return TRIP_FIELD_ORDER.length;
}

// ── Field UI ──────────────────────────────────────────────────
function TField({ label, value, onChange, placeholder, error, disabled, filter }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; disabled?: boolean;
  filter?: (v: string) => string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</label>
      <input
        value={value} placeholder={placeholder} disabled={disabled}
        onChange={e => onChange(filter ? filter(e.target.value) : e.target.value)}
        style={{ width: '100%', border: `1.5px solid ${error ? '#BF4646' : '#EDDCC6'}`, borderRadius: 9, padding: '10px 13px', fontSize: 14, background: disabled ? '#F5EDE4' : '#fff', color: disabled ? '#aaa' : '#2C1810', outline: 'none', fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'text' }}
      />
      {error && <div style={{ marginTop: 5, fontSize: 12, color: '#BF4646', fontWeight: 600 }}>⚠ {error}</div>}
    </div>
  );
}

function TSelect({ label, value, onChange, children, error, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  children: React.ReactNode; error?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ width: '100%', border: `1.5px solid ${error ? '#BF4646' : '#EDDCC6'}`, borderRadius: 9, padding: '10px 13px', fontSize: 14, background: disabled ? '#F5EDE4' : '#fff', color: disabled ? '#aaa' : '#2C1810', outline: 'none', fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {children}
      </select>
      {error && <div style={{ marginTop: 5, fontSize: 12, color: '#BF4646', fontWeight: 600 }}>⚠ {error}</div>}
    </div>
  );
}

// ── Dispatch Modal ────────────────────────────────────────────
function DispatchModal({ open, onClose, onAdd, availableVehicles, availableDrivers, allVehicles }: {
  open: boolean; onClose: () => void;
  onAdd: (f: TripForm) => void;
  availableVehicles: any[]; availableDrivers: any[]; allVehicles: any[];
}) {
  const [form, setForm]     = useState<TripForm>(emptyTrip);
  const [errors, setErrors] = useState<FieldErr>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TripForm, boolean>>>({});

  const selectedVehicle = allVehicles.find(v => v.id === form.vehicleId);
  const maxCap = selectedVehicle ? selectedVehicle.maxLoadCapacity : null;

  const currentErrors = validateTripForm(form, maxCap);
  const unlockedUpTo  = firstInvalidIndex(form, currentErrors);

  const isDisabled = (k: keyof TripForm) => TRIP_FIELD_ORDER.indexOf(k) > unlockedUpTo;

  const set = (k: keyof TripForm, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    const errs = validateTripForm(next, maxCap);
    setErrors(prev => ({ ...prev, [k]: errs[k] }));
    setTouched(t => ({ ...t, [k]: true }));
  };

  const handleSubmit = () => {
    const errs = validateTripForm(form, maxCap);
    setErrors(errs);
    const allTouched: any = {};
    TRIP_FIELD_ORDER.forEach(k => (allTouched[k] = true));
    setTouched(allTouched);
    if (Object.keys(errs).length > 0) return;
    onAdd(form);
    setForm(emptyTrip); setErrors({}); setTouched({});
  };

  const handleClose = () => {
    setForm(emptyTrip); setErrors({}); setTouched({});
    onClose();
  };

  if (!open) return null;

  const showErr = (k: keyof TripForm) => touched[k] ? errors[k] : undefined;

  return (
    <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.52)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFF4EA', borderRadius: 16, padding: '28px 28px 24px', width: '100%', maxWidth: 500, boxShadow: '0 24px 60px rgba(44,24,16,0.3)', border: '1.5px solid #EDDCC6', maxHeight: '94vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: '#2C1810', margin: 0 }}>Create New Trip</h3>
            <p style={{ fontSize: 12, color: '#8B5E52', marginTop: 3 }}>Complete each step — next field unlocks when current is valid.</p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#8B5E52', lineHeight: 1 }}>×</button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, margin: '14px 0 20px' }}>
          {TRIP_FIELD_ORDER.map((k, i) => (
            <div key={k} style={{ height: 4, flex: 1, borderRadius: 2, background: i < unlockedUpTo ? '#BF4646' : i === unlockedUpTo ? '#EDDCC6' : '#F0E8DF', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 1 – Vehicle */}
          <TSelect label="1. Assign Vehicle" value={form.vehicleId} onChange={v => set('vehicleId', v)} error={showErr('vehicleId')} disabled={isDisabled('vehicleId')}>
            <option value="">— Select available vehicle —</option>
            {availableVehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name} ({v.licensePlate}) · Max {v.maxLoadCapacity.toLocaleString()} kg</option>
            ))}
          </TSelect>

          {/* 2 – Driver */}
          <TSelect label="2. Assign Driver" value={form.driverId} onChange={v => set('driverId', v)} error={showErr('driverId')} disabled={isDisabled('driverId')}>
            <option value="">— Select available driver —</option>
            {availableDrivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </TSelect>

          {/* 3 & 4 – Origin / Destination in grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TField label="3. Origin City" value={form.origin} onChange={v => set('origin', v)} placeholder="e.g. Chicago, IL"
              filter={onlyLettersSpacesComma} error={showErr('origin')} disabled={isDisabled('origin')} />
            <TField label="4. Destination City" value={form.destination} onChange={v => set('destination', v)} placeholder="e.g. Detroit, MI"
              filter={onlyLettersSpacesComma} error={showErr('destination')} disabled={isDisabled('destination')} />
          </div>

          {/* 5 – Cargo Weight */}
          <div>
            <TField label="5. Cargo Weight (kg)" value={form.cargoWeight} onChange={v => set('cargoWeight', v)} placeholder="e.g. 5000"
              filter={onlyPositiveInt} error={showErr('cargoWeight')} disabled={isDisabled('cargoWeight')} />
            {/* Live capacity indicator */}
            {selectedVehicle && form.cargoWeight && !errors.cargoWeight && (
              <div style={{ marginTop: 5, fontSize: 12, color: '#7EACB5', fontWeight: 600 }}>
                ✓ Within limit — vehicle max is {selectedVehicle.maxLoadCapacity.toLocaleString()} kg
              </div>
            )}
            {selectedVehicle && form.cargoWeight && errors.cargoWeight?.startsWith('⛔') && (
              <div style={{ marginTop: 5, fontSize: 12, fontWeight: 700, color: '#BF4646', background: 'rgba(191,70,70,0.08)', border: '1.5px solid #BF4646', borderRadius: 8, padding: '8px 12px' }}>
                ⛔ {errors.cargoWeight}
              </div>
            )}
          </div>

          {/* 6 & 7 – Distance / Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TField label="6. Distance (km)" value={form.distance} onChange={v => set('distance', v)} placeholder="e.g. 350"
              filter={onlyPositiveInt} error={showErr('distance')} disabled={isDisabled('distance')} />
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 6 }}>7. Scheduled Date</label>
              <input type="date" value={form.scheduledDate} disabled={isDisabled('scheduledDate')}
                onChange={e => set('scheduledDate', e.target.value)}
                style={{ width: '100%', border: `1.5px solid ${showErr('scheduledDate') ? '#BF4646' : '#EDDCC6'}`, borderRadius: 9, padding: '10px 13px', fontSize: 14, background: isDisabled('scheduledDate') ? '#F5EDE4' : '#fff', color: isDisabled('scheduledDate') ? '#aaa' : '#2C1810', outline: 'none', fontFamily: 'inherit', cursor: isDisabled('scheduledDate') ? 'not-allowed' : 'pointer' }} />
              {showErr('scheduledDate') && <div style={{ marginTop: 5, fontSize: 12, color: '#BF4646', fontWeight: 600 }}>⚠ {showErr('scheduledDate')}</div>}
            </div>
          </div>

          {/* Summary of remaining errors after attempt */}
          {Object.values(touched).some(Boolean) && Object.keys(currentErrors).length > 0 && (
            <div style={{ background: 'rgba(191,70,70,0.07)', border: '1.5px solid rgba(191,70,70,0.3)', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#BF4646', fontWeight: 600 }}>
              {Object.keys(currentErrors).length} field{Object.keys(currentErrors).length > 1 ? 's' : ''} need attention before submitting.
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={handleClose} style={{ flex: 1, background: '#EDDCC6', color: '#2C1810', border: 'none', padding: '12px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={handleSubmit}
              style={{ flex: 1, background: '#BF4646', color: '#fff', border: 'none', padding: '12px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: Object.keys(currentErrors).length > 0 ? 0.6 : 1 }}>
              Create Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Trips() {
  const { vehicles, drivers, trips, addTrip, advanceTripStatus } = useStore();
  const [modal, setModal] = useState(false);

  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const availableDrivers  = drivers.filter(d => d.status === 'active' && new Date(d.licenseExpiry) > new Date());

  const handleAdd = (form: TripForm) => {
    addTrip({ vehicleId: form.vehicleId, driverId: form.driverId, origin: form.origin.trim(), destination: form.destination.trim(), cargoWeight: Number(form.cargoWeight), scheduledDate: form.scheduledDate, distance: Number(form.distance) });
    setModal(false);
  };

  return (
    <>
      <DispatchModal open={modal} onClose={() => setModal(false)} onAdd={handleAdd}
        availableVehicles={availableVehicles} availableDrivers={availableDrivers} allVehicles={vehicles} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: '#2C1810', marginBottom: 4, fontWeight: 900 }}>Trip Dispatcher</h1>
          <p style={{ color: '#8B5E52', fontSize: 13 }}>{availableVehicles.length} vehicles · {availableDrivers.length} drivers available</p>
        </div>
        <button onClick={() => setModal(true)} style={{ background: '#BF4646', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>
          + Dispatch Trip
        </button>
      </div>

      {/* Trip cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {trips.map(trip => {
          const vehicle = vehicles.find(v => v.id === trip.vehicleId);
          const driver  = drivers.find(d => d.id === trip.driverId);
          return (
            <div key={trip.id} style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, padding: '20px 22px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' as const }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' as const }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#2C1810' }}>{trip.origin}</span>
                  <span style={{ color: '#BF4646', fontSize: 18 }}>→</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#2C1810' }}>{trip.destination}</span>
                  <Pill status={trip.status} />
                </div>
                <div style={{ fontSize: 12, color: '#8B5E52', display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
                  <span>🚛 {vehicle?.name || trip.vehicleId}</span>
                  <span>👤 {driver?.name || trip.driverId}</span>
                  <span>⚖ {trip.cargoWeight.toLocaleString()} kg</span>
                  <span>📅 {trip.scheduledDate}</span>
                  {trip.distance > 0 && <span>📍 {trip.distance} km</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Stepper status={trip.status} />
                {trip.status !== 'completed' && (
                  <button onClick={() => advanceTripStatus(trip.id)}
                    style={{ background: '#7EACB5', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {trip.status === 'draft' ? 'Dispatch →' : 'Complete ✓'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {trips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8B5E52', fontSize: 14 }}>No trips yet. Click + Dispatch Trip to get started.</div>
        )}
      </div>
    </>
  );
}