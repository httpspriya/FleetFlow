'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useMaintenanceLogs, useMaintenanceMutations } from '@/lib/hooks/use-fleet-data';

type ServiceStatus = 'New' | 'In Progress' | 'Resolved';
interface ServiceLog {
  id: string; vehicleId?: string; vehicleName: string; issue: string; date: string; cost: number; status: ServiceStatus;
}

const onlyPositiveInt = (v: string) => v.replace(/[^0-9]/g, '');
const FIELD_ORDER = ['vehicleId', 'issue', 'date', 'cost'];

function validateLog(f: { vehicleId: string; issue: string; date: string; cost: string }) {
  const e: any = {};
  if (!f.vehicleId) e.vehicleId = 'Select a vehicle.';
  if (!f.issue.trim()) e.issue = 'Issue/Service description is required.';
  if (!f.date) e.date = 'Date is required.';
  if (!f.cost) e.cost = 'Cost is required.';
  else if (Number(f.cost) <= 0) e.cost = 'Must be greater than 0.';
  return e;
}

function firstInvalid(f: any, errors: any) {
  for (let i = 0; i < FIELD_ORDER.length; i++) {
    if (!f[FIELD_ORDER[i]] || errors[FIELD_ORDER[i]]) return i;
  }
  return FIELD_ORDER.length;
}

// ── Universal KPI Card ────────────────────────────────────────
const KPICard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 10, padding: '14px 20px', minWidth: 100, flex: 1 }}>
    <div style={{ fontSize: 26, fontWeight: 900, color: '#2C1810', fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#2C1810', fontWeight: 700, marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: '#8B5E52', marginTop: 2 }}>{sub}</div>}
  </div>
);

function toServiceLog(l: any): ServiceLog {
  return {
    id: l.id,
    vehicleId: l.vehicleId,
    vehicleName: l.vehicle?.name ?? '—',
    issue: l.issue ?? '—',
    date: l.serviceDate ? new Date(l.serviceDate).toISOString().slice(0, 10) : '—',
    cost: Number(l.cost),
    status: 'New',
  };
}

export default function MaintenanceLogs() {
  const { vehicles } = useStore();
  const { logs: apiLogs, isLoading } = useMaintenanceLogs();
  const { create: createLog, remove: removeLog } = useMaintenanceMutations();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'cost'>('date');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', issue: '', date: '', cost: '' });
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});

  const logs: ServiceLog[] = useMemo(() => (apiLogs || []).map(toServiceLog), [apiLogs]);

  const currentErrors = validateLog(form);
  const unlockedUpTo = firstInvalid(form, currentErrors);
  const isDisabled = (k: string) => FIELD_ORDER.indexOf(k) > unlockedUpTo;

  const set = (k: string, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    setErrors((p: any) => ({ ...p, [k]: validateLog(next)[k] }));
    setTouched((t: any) => ({ ...t, [k]: true }));
  };
  const showErr = (k: string) => touched[k] ? errors[k] : undefined;

  const handleCreate = () => {
    const errs = validateLog(form);
    setErrors(errs);
    const all: any = {}; FIELD_ORDER.forEach(k => (all[k] = true)); setTouched(all);
    if (Object.keys(errs).length > 0) return;
    createLog.mutate(
      { vehicleId: form.vehicleId, cost: Number(form.cost), issue: form.issue.trim() || undefined, serviceDate: form.date || undefined },
      { onSuccess: () => { setModal(false); setForm({ vehicleId: '', issue: '', date: '', cost: '' }); setErrors({}); setTouched({}); } }
    );
  };

  const filtered = useMemo(() => logs
    .filter(l => l.vehicleName.toLowerCase().includes(search.toLowerCase()) || l.issue.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'date' ? b.date.localeCompare(a.date) : b.cost - a.cost),
  [logs, search, sortBy]);

  const Field = ({ label, value, onChange, placeholder, type = 'text', error, disabled, filterFn }: any) => (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 5 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} disabled={disabled}
        onChange={e => onChange(filterFn ? filterFn(e.target.value) : e.target.value)}
        style={{ width: '100%', border: `1.5px solid ${error ? '#BF4646' : disabled ? '#E8DDD4' : '#EDDCC6'}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, background: disabled ? '#F5EDE4' : '#fff', color: disabled ? '#aaa' : '#2C1810', outline: 'none', fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'text', boxSizing: 'border-box' as const }} />
      {error && <div style={{ marginTop: 4, fontSize: 11, color: '#BF4646', fontWeight: 600 }}>⚠ {error}</div>}
    </div>
  );

  return (
    <>
      {modal && (
        <div onClick={() => setModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.52)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF4EA', borderRadius: 16, padding: '26px 26px 22px', width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(44,24,16,0.3)', border: '1.5px solid #EDDCC6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 19, color: '#2C1810', margin: 0 }}>New Service Log</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#8B5E52' }}>×</button>
            </div>
            <p style={{ fontSize: 11, color: '#8B5E52', marginBottom: 16 }}>Fill each field — next unlocks when current is valid.</p>
            <div style={{ display: 'flex', gap: 5, marginBottom: 18 }}>
              {FIELD_ORDER.map((k, i) => (
                <div key={k} style={{ height: 3, flex: 1, borderRadius: 2, background: i < unlockedUpTo ? '#BF4646' : '#EDDCC6', transition: 'background 0.3s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 5 }}>1. Vehicle</label>
                <select value={form.vehicleId} disabled={isDisabled('vehicleId')} onChange={e => set('vehicleId', e.target.value)}
                  style={{ width: '100%', border: `1.5px solid ${showErr('vehicleId') ? '#BF4646' : '#EDDCC6'}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, background: '#fff', color: '#2C1810', outline: 'none', fontFamily: 'inherit', cursor: isDisabled('vehicleId') ? 'not-allowed' : 'pointer' }}>
                  <option value="">— Select vehicle —</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
                </select>
                {showErr('vehicleId') && <div style={{ marginTop: 4, fontSize: 11, color: '#BF4646', fontWeight: 600 }}>⚠ {showErr('vehicleId')}</div>}
              </div>
              <Field label="2. Issue / Service" value={form.issue} placeholder="e.g. Engine Issue" error={showErr('issue')} disabled={isDisabled('issue')} onChange={(v: string) => set('issue', v)} />
              <Field label="3. Date" type="date" value={form.date} error={showErr('date')} disabled={isDisabled('date')} onChange={(v: string) => set('date', v)} />
              <Field label="4. Cost (₹)" value={form.cost} placeholder="e.g. 10000" error={showErr('cost')} filterFn={onlyPositiveInt} disabled={isDisabled('cost')} onChange={(v: string) => set('cost', v)} />
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setModal(false)} style={{ flex: 1, background: '#EDDCC6', color: '#2C1810', border: 'none', padding: '11px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={handleCreate} style={{ flex: 1, background: '#BF4646', color: '#fff', border: 'none', padding: '11px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: Object.keys(currentErrors).length > 0 ? 0.6 : 1 }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && <div style={{ padding: 12, color: '#8B5E52', fontSize: 13 }}>Loading maintenance logs…</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: '#2C1810', marginBottom: 4, fontWeight: 900 }}>Maintenance & Service Logs</h1>
          <p style={{ color: '#8B5E52', fontSize: 13 }}>{logs.length} total logs</p>
        </div>
        <button onClick={() => setModal(true)} style={{ background: '#BF4646', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>+ Create New Service</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const }}>
        <KPICard label="Total Cost" value={`₹${logs.reduce((s, l) => s + l.cost, 0).toLocaleString('en-IN')}`} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <input placeholder="🔍  Search logs…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '9px 14px', fontSize: 13, background: '#fff', color: '#2C1810', fontFamily: 'inherit', outline: 'none' }} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          style={{ border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '9px 14px', fontSize: 13, background: '#fff', color: '#2C1810', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
          <option value="date">Sort: Date</option>
          <option value="cost">Sort: Cost</option>
        </select>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FFF4EA' }}>
              {['Log ID', 'Vehicle', 'Issue / Service', 'Date', 'Cost', 'Status', 'Action'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8B5E52', borderBottom: '2px solid #EDDCC6', whiteSpace: 'nowrap' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #EDDCC6', background: i % 2 === 0 ? '#fff' : '#FEFAF6' }}>
                <td style={{ padding: '12px 16px' }}><code style={{ background: '#EDDCC6', padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>{l.id.slice(0, 8)}</code></td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2C1810' }}>{l.vehicleName}</td>
                <td style={{ padding: '12px 16px', color: '#2C1810' }}>{l.issue}</td>
                <td style={{ padding: '12px 16px', color: '#8B5E52' }}>{l.date}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2C1810' }}>₹{l.cost.toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}>—</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => removeLog.mutate(l.id)} style={{ background: '#BF4646', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '36px 20px', color: '#8B5E52' }}>No service logs found.</div>}
      </div>
    </>
  );
}