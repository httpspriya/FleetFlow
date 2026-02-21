'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useExpenses, useExpenseMutations } from '@/lib/hooks/use-fleet-data';

const onlyPositiveInt = (v: string) => v.replace(/[^0-9]/g, '');

type EForm = { vehicleId: string; amount: string };
const emptyForm: EForm = { vehicleId: '', amount: '' };

function validateExpense(f: EForm) {
  const e: any = {};
  if (!f.vehicleId) e.vehicleId = 'Select a vehicle.';
  if (!f.amount) e.amount = 'Amount is required.';
  else if (Number(f.amount) <= 0) e.amount = 'Must be greater than 0.';
  return e;
}

const KPICard = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 10, padding: '14px 20px', flex: 1, minWidth: 100 }}>
    <div style={{ fontSize: 22, fontWeight: 900, color: '#2C1810', fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#2C1810', fontWeight: 700, marginTop: 4 }}>{label}</div>
  </div>
);

export default function ExpenseFuel() {
  const { vehicles } = useStore();
  const { expenses: apiExpenses, isLoading } = useExpenses();
  const { create: createExpense } = useExpenseMutations();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<EForm>(emptyForm);
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});

  const expenses = useMemo(() => (apiExpenses || []).map((e: any) => ({
    id: e.id,
    vehicleId: e.vehicleId,
    vehicleName: e.vehicle?.name ?? '—',
    amount: Number(e.amount),
  })), [apiExpenses]);

  const set = (k: string, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    setErrors((p: any) => ({ ...p, [k]: validateExpense(next)[k] }));
    setTouched((t: any) => ({ ...t, [k]: true }));
  };
  const showErr = (k: string) => touched[k] ? errors[k] : undefined;

  const handleCreate = () => {
    const errs = validateExpense(form);
    setErrors(errs);
    setTouched({ vehicleId: true, amount: true });
    if (Object.keys(errs).length > 0) return;
    createExpense.mutate(
      { vehicleId: form.vehicleId, amount: Number(form.amount) },
      { onSuccess: () => { setModal(false); setForm(emptyForm); setErrors({}); setTouched({}); } }
    );
  };

  const filtered = useMemo(() => expenses
    .filter(e => e.vehicleName.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.amount - a.amount),
  [expenses, search]);

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      {modal && (
        <div onClick={() => setModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.52)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF4EA', borderRadius: 16, padding: '26px 26px 22px', width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(44,24,16,0.3)', border: '1.5px solid #EDDCC6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 19, color: '#2C1810', margin: 0 }}>Add an Expense</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#8B5E52' }}>×</button>
            </div>
            <p style={{ fontSize: 11, color: '#8B5E52', marginBottom: 14 }}>Record an expense for a vehicle.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 5 }}>Vehicle</label>
                <select value={form.vehicleId} onChange={e => set('vehicleId', e.target.value)}
                  style={{ width: '100%', border: `1.5px solid ${showErr('vehicleId') ? '#BF4646' : '#EDDCC6'}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, background: '#fff', color: '#2C1810', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="">— Select vehicle —</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>)}
                </select>
                {showErr('vehicleId') && <div style={{ marginTop: 4, fontSize: 11, color: '#BF4646', fontWeight: 600 }}>⚠ {showErr('vehicleId')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 5 }}>Amount (₹)</label>
                <input placeholder="e.g. 19000" value={form.amount} onChange={e => set('amount', onlyPositiveInt(e.target.value))}
                  style={{ width: '100%', border: `1.5px solid ${showErr('amount') ? '#BF4646' : '#EDDCC6'}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, background: '#fff', color: '#2C1810', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
                {showErr('amount') && <div style={{ marginTop: 4, fontSize: 11, color: '#BF4646', fontWeight: 600 }}>⚠ {showErr('amount')}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setModal(false)} style={{ flex: 1, background: '#EDDCC6', color: '#2C1810', border: 'none', padding: '11px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={handleCreate} style={{ flex: 1, background: '#BF4646', color: '#fff', border: 'none', padding: '11px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: Object.keys(validateExpense(form)).length > 0 ? 0.6 : 1 }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && <div style={{ padding: 12, color: '#8B5E52', fontSize: 13 }}>Loading expenses…</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: '#2C1810', marginBottom: 4, fontWeight: 900 }}>Expense & Fuel Logging</h1>
          <p style={{ color: '#8B5E52', fontSize: 13 }}>{expenses.length} expense records</p>
        </div>
        <button onClick={() => setModal(true)} style={{ background: '#BF4646', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>+ Add an Expense</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const }}>
        <KPICard label="Total Spend" value={`₹${totalAmount.toLocaleString('en-IN')}`} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <input placeholder="🔍  Search by vehicle…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 320, border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '9px 14px', fontSize: 13, background: '#fff', color: '#2C1810', fontFamily: 'inherit', outline: 'none' }} />
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FFF4EA' }}>
              {['Exp ID', 'Vehicle', 'Amount'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8B5E52', borderBottom: '2px solid #EDDCC6', whiteSpace: 'nowrap' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #EDDCC6', background: i % 2 === 0 ? '#fff' : '#FEFAF6' }}>
                <td style={{ padding: '12px 16px' }}><code style={{ background: '#EDDCC6', padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>{e.id.slice(0, 8)}</code></td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2C1810' }}>{e.vehicleName}</td>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#2C1810' }}>₹{e.amount.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '36px 20px', color: '#8B5E52' }}>No expense records found.</div>}
      </div>
    </>
  );
}
