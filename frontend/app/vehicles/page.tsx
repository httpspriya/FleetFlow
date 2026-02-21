'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';

// ── Status Pill ──────────────────────────────────────────────
const statusColor: Record<string, { bg: string; color: string; label: string }> = {
  available:       { bg: '#7EACB5', color: '#fff', label: 'Available' },
  on_trip:         { bg: '#BF4646', color: '#fff', label: 'On Trip' },
  in_shop:         { bg: '#8B5E52', color: '#fff', label: 'In Shop' },
  out_of_service:  { bg: '#bbb',    color: '#fff', label: 'Out of Service' },
};
const Pill = ({ status }: { status: string }) => {
  const s = statusColor[status] || { bg: '#eee', color: '#333', label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const }}>
      {s.label}
    </span>
  );
};

// ── Field component with inline error & blocking ─────────────
type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  filter?: (v: string) => string; // transforms input before setting
};
const Field = ({ label, value, onChange, placeholder, type = 'text', error, disabled, filter }: FieldProps) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 6 }}>
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={e => {
        const raw = filter ? filter(e.target.value) : e.target.value;
        onChange(raw);
      }}
      style={{
        width: '100%',
        border: `1.5px solid ${error ? '#BF4646' : disabled ? '#E0D4C8' : '#EDDCC6'}`,
        borderRadius: 9,
        padding: '10px 13px',
        fontSize: 14,
        background: disabled ? '#F5EDE4' : '#fff',
        color: disabled ? '#aaa' : '#2C1810',
        outline: 'none',
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'text',
        transition: 'border-color 0.15s',
      }}
    />
    {error && (
      <div style={{ marginTop: 5, fontSize: 12, color: '#BF4646', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>⚠</span> {error}
      </div>
    )}
  </div>
);

// ── Validation rules ─────────────────────────────────────────
const onlyLettersSpaces = (v: string) => v.replace(/[^a-zA-Z\s]/g, '');
const onlyAlphaHyphen   = (v: string) => v.replace(/[^a-zA-Z0-9\-]/g, '').toUpperCase();
const onlyPositiveInt   = (v: string) => v.replace(/[^0-9]/g, '');

function validateVehicleForm(f: typeof emptyForm, existingPlates: string[]) {
  const errors: Partial<typeof emptyForm> = {};
  if (!f.name.trim())
    errors.name = 'Vehicle name is required.';
  else if (!/^[a-zA-Z\s]+$/.test(f.name.trim()))
    errors.name = 'Name must contain only letters.';

  if (!f.licensePlate.trim())
    errors.licensePlate = 'License plate is required.';
  else if (!/^[A-Z0-9\-]+$/.test(f.licensePlate.trim()))
    errors.licensePlate = 'Only letters, numbers and hyphens allowed.';
  else if (existingPlates.includes(f.licensePlate.trim().toUpperCase()))
    errors.licensePlate = 'This license plate already exists.';

  if (!f.maxLoadCapacity)
    errors.maxLoadCapacity = 'Max load capacity is required.';
  else if (Number(f.maxLoadCapacity) <= 0)
    errors.maxLoadCapacity = 'Must be greater than 0.';
  else if (Number(f.maxLoadCapacity) > 100000)
    errors.maxLoadCapacity = 'Value seems too high (max 100,000 kg).';

  if (!f.odometer)
    errors.odometer = 'Odometer reading is required.';
  else if (Number(f.odometer) < 0)
    errors.odometer = 'Cannot be negative.';

  return errors;
}

const emptyForm = { name: '', licensePlate: '', maxLoadCapacity: '', odometer: '', type: 'Van' };

// ── Order of fields – used for "block next field until current valid" ──
const FIELD_ORDER = ['name', 'licensePlate', 'maxLoadCapacity', 'odometer', 'type'] as const;

function firstInvalidIndex(f: typeof emptyForm, errors: Partial<typeof emptyForm>) {
  for (let i = 0; i < FIELD_ORDER.length; i++) {
    const k = FIELD_ORDER[i];
    if (!f[k] || errors[k as keyof typeof errors]) return i;
  }
  return FIELD_ORDER.length; // all good
}

// ── Modal ─────────────────────────────────────────────────────
function AddVehicleModal({ open, onClose, onAdd, existingPlates }: {
  open: boolean; onClose: () => void;
  onAdd: (f: typeof emptyForm) => void;
  existingPlates: string[];
}) {
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof emptyForm, boolean>>>({});

  const set = (k: keyof typeof emptyForm, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    // re-validate only touched fields
    const errs = validateVehicleForm(next, existingPlates);
    setErrors(prev => ({ ...prev, [k]: errs[k] }));
  };

  const touch = (k: keyof typeof emptyForm) =>
    setTouched(t => ({ ...t, [k]: true }));

  const unlockedUpTo = firstInvalidIndex(
    form,
    validateVehicleForm(form, existingPlates)
  );

  const handleSubmit = () => {
    const errs = validateVehicleForm(form, existingPlates);
    setErrors(errs);
    setTouched({ name: true, licensePlate: true, maxLoadCapacity: true, odometer: true, type: true });
    if (Object.keys(errs).length > 0) return;
    onAdd(form);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
  };

  const handleClose = () => {
    setForm(emptyForm); setErrors({}); setTouched({});
    onClose();
  };

  if (!open) return null;

  const isDisabled = (k: keyof typeof emptyForm) => {
    const idx = FIELD_ORDER.indexOf(k);
    return idx > unlockedUpTo;
  };

  return (
    <div onClick={handleClose} style={{ position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.52)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FFF4EA', borderRadius: 16, padding: '28px 28px 24px', width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(44,24,16,0.3)', border: '1.5px solid #EDDCC6', maxHeight: '92vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: '#2C1810', margin: 0 }}>Register New Vehicle</h3>
            <p style={{ fontSize: 12, color: '#8B5E52', marginTop: 3 }}>Fill each field in order — next unlocks when current is valid.</p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#8B5E52', lineHeight: 1 }}>×</button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
          {FIELD_ORDER.map((k, i) => (
            <div key={k} style={{ height: 4, flex: 1, borderRadius: 2, background: i < unlockedUpTo ? '#BF4646' : i === unlockedUpTo ? '#EDDCC6' : '#F0E8DF', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 1 – Vehicle Name: letters only */}
          <Field
            label="1. Vehicle Name"
            value={form.name}
            placeholder="e.g. Titan Hauler"
            error={touched.name ? errors.name : undefined}
            filter={onlyLettersSpaces}
            disabled={isDisabled('name')}
            onChange={v => { set('name', v); touch('name'); }}
          />

          {/* 2 – License Plate: letters, numbers, hyphen; no @ or special */}
          <Field
            label="2. License Plate (Unique ID)"
            value={form.licensePlate}
            placeholder="e.g. TRK-0001"
            error={touched.licensePlate ? errors.licensePlate : undefined}
            filter={onlyAlphaHyphen}
            disabled={isDisabled('licensePlate')}
            onChange={v => { set('licensePlate', v); touch('licensePlate'); }}
          />

          {/* 3 – Max Load: digits only, no e / + / @ */}
          <Field
            label="3. Max Load Capacity (kg)"
            value={form.maxLoadCapacity}
            placeholder="e.g. 5000"
            type="text"
            inputMode={'numeric' as any}
            error={touched.maxLoadCapacity ? errors.maxLoadCapacity : undefined}
            filter={onlyPositiveInt}
            disabled={isDisabled('maxLoadCapacity')}
            onChange={v => { set('maxLoadCapacity', v); touch('maxLoadCapacity'); }}
          />

          {/* 4 – Odometer: digits only */}
          <Field
            label="4. Current Odometer (km)"
            value={form.odometer}
            placeholder="e.g. 45000"
            type="text"
            inputMode={'numeric' as any}
            error={touched.odometer ? errors.odometer : undefined}
            filter={onlyPositiveInt}
            disabled={isDisabled('odometer')}
            onChange={v => { set('odometer', v); touch('odometer'); }}
          />

          {/* 5 – Type */}
          <div style={{ opacity: isDisabled('type') ? 0.45 : 1, pointerEvents: isDisabled('type') ? 'none' : 'auto' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 6 }}>5. Vehicle Type</label>
            <select value={form.type} onChange={e => { set('type', e.target.value); touch('type'); }}
              style={{ width: '100%', border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '10px 13px', fontSize: 14, background: '#fff', color: '#2C1810', outline: 'none', fontFamily: 'inherit' }}>
              {['Van', 'Light Truck', 'Heavy Truck', 'Refrigerated'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button onClick={handleClose} style={{ flex: 1, background: '#EDDCC6', color: '#2C1810', border: 'none', padding: '12px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} style={{ flex: 1, background: '#BF4646', color: '#fff', border: 'none', padding: '12px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: Object.keys(validateVehicleForm(form, existingPlates)).length > 0 ? 0.6 : 1 }}>
              Register Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Vehicles() {
  const { vehicles, sendToShop, retireVehicle, addVehicle } = useStore();
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);

  const existingPlates = vehicles.map(v => v.licensePlate.toUpperCase());

  const filtered = useMemo(() =>
    vehicles.filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(search.toLowerCase())
    ), [vehicles, search]);

  const handleAdd = (form: typeof emptyForm) => {
    addVehicle({ name: form.name.trim(), licensePlate: form.licensePlate.trim().toUpperCase(), maxLoadCapacity: Number(form.maxLoadCapacity), odometer: Number(form.odometer), type: form.type });
    setModal(false);
  };

  return (
    <>
      <AddVehicleModal open={modal} onClose={() => setModal(false)} onAdd={handleAdd} existingPlates={existingPlates} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: '#2C1810', marginBottom: 4, fontWeight: 900 }}>Vehicle Registry</h1>
          <p style={{ color: '#8B5E52', fontSize: 13 }}>{vehicles.length} assets registered</p>
        </div>
        <button onClick={() => setModal(true)} style={{ background: '#BF4646', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>
          + Add Vehicle
        </button>
      </div>

      {/* Search */}
      <input placeholder="🔍  Search by name or license plate…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 380, border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '10px 16px', fontSize: 13, background: '#fff', color: '#2C1810', fontFamily: 'inherit', outline: 'none', marginBottom: 18, display: 'block' }} />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const }}>
        {([['Total', vehicles.length], ['Available', vehicles.filter(v => v.status === 'available').length], ['On Trip', vehicles.filter(v => v.status === 'on_trip').length], ['In Shop', vehicles.filter(v => v.status === 'in_shop').length], ['Retired', vehicles.filter(v => v.status === 'out_of_service').length]] as [string, number][]).map(([label, count]) => (
          <div key={label} style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 10, padding: '10px 18px', minWidth: 80, textAlign: 'center' as const }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#2C1810', fontFamily: "'Playfair Display',Georgia,serif" }}>{count}</div>
            <div style={{ fontSize: 11, color: '#8B5E52', fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FFF4EA' }}>
              {['Vehicle', 'License Plate', 'Type', 'Max Load', 'Odometer', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8B5E52', borderBottom: '2px solid #EDDCC6', whiteSpace: 'nowrap' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #EDDCC6', background: i % 2 === 0 ? '#fff' : '#FEFAF6' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontWeight: 700, color: '#2C1810' }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: '#8B5E52', marginTop: 1 }}>{v.id}</div>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <code style={{ background: '#EDDCC6', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#2C1810' }}>{v.licensePlate}</code>
                </td>
                <td style={{ padding: '13px 16px', color: '#8B5E52' }}>{v.type}</td>
                <td style={{ padding: '13px 16px', fontWeight: 600 }}>{v.maxLoadCapacity.toLocaleString()} kg</td>
                <td style={{ padding: '13px 16px', fontWeight: 600 }}>{v.odometer.toLocaleString()} km</td>
                <td style={{ padding: '13px 16px' }}><Pill status={v.status} /></td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {v.status !== 'in_shop' && v.status !== 'out_of_service' && (
                      <button onClick={() => sendToShop(v.id)} style={{ background: '#EDDCC6', color: '#2C1810', border: 'none', padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🔧 Shop</button>
                    )}
                    <button onClick={() => retireVehicle(v.id)} style={{ background: v.status === 'out_of_service' ? '#7EACB5' : 'transparent', color: v.status === 'out_of_service' ? '#fff' : '#BF4646', border: `1.5px solid ${v.status === 'out_of_service' ? '#7EACB5' : '#BF4646'}`, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {v.status === 'out_of_service' ? '↩ Reinstate' : '⊘ Retire'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8B5E52' }}>No vehicles found{search ? ` for "${search}"` : ''}.</div>
        )}
      </div>
    </>
  );
}