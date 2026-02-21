'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';

// ── Universal KPI Card ────────────────────────────────────────
const KPICard = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 10, padding: '14px 20px', flex: 1, minWidth: 100 }}>
    <div style={{ fontSize: 26, fontWeight: 900, color: '#2C1810', fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#2C1810', fontWeight: 700, marginTop: 4 }}>{label}</div>
  </div>
);

const ScoreBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: '#EDDCC6', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3 }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: '#2C1810', minWidth: 36, textAlign: 'right' as const }}>{value}%</span>
  </div>
);

export default function DriverProfiles() {
  const { drivers, toggleDriverDuty } = useStore();
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState<'safetyScore' | 'completionRate' | 'complaints'>('safetyScore');
  const [filterExp, setFilterExp] = useState<'All' | 'Valid' | 'Expired'>('All');
  const today = new Date();

  const perfData = [
    { completionRate: 92, safetyScore: 89, complaints: 4 },
    { completionRate: 88, safetyScore: 91, complaints: 2 },
    { completionRate: 74, safetyScore: 62, complaints: 7 },
    { completionRate: 96, safetyScore: 97, complaints: 0 },
    { completionRate: 85, safetyScore: 83, complaints: 3 },
  ];

  const enriched = drivers.map((d, i) => ({
    ...d,
    completionRate: perfData[i]?.completionRate ?? 80,
    safetyScore:    perfData[i]?.safetyScore    ?? 75,
    complaints:     perfData[i]?.complaints     ?? 1,
  }));

  const filtered = useMemo(() => enriched
    .filter(d => {
      const exp = new Date(d.licenseExpiry) < today;
      if (filterExp === 'Valid')   return !exp;
      if (filterExp === 'Expired') return exp;
      return true;
    })
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'complaints' ? b.complaints - a.complaints : b[sortBy] - a[sortBy])
  , [enriched, search, sortBy, filterExp]);

  const avgSafety     = Math.round(enriched.reduce((s, d) => s + d.safetyScore, 0) / enriched.length);
  const avgCompletion = Math.round(enriched.reduce((s, d) => s + d.completionRate, 0) / enriched.length);
  const expiredCount  = enriched.filter(d => new Date(d.licenseExpiry) < today).length;
  const totalComplaints = enriched.reduce((s, d) => s + d.complaints, 0);

  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    active:   { bg: '#7EACB5', color: '#fff', label: 'Active' },
    off_duty: { bg: '#EDDCC6', color: '#8B5E52', label: 'Off Duty' },
    on_trip:  { bg: '#BF4646', color: '#fff', label: 'On Trip' },
  };

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: '#2C1810', marginBottom: 4, fontWeight: 900 }}>Driver Performance & Safety</h1>
        <p style={{ color: '#8B5E52', fontSize: 13 }}>{drivers.length} drivers · {expiredCount} expired license{expiredCount !== 1 ? 's' : ''}</p>
      </div>

      {/* KPI Row — all #2C1810 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const }}>
        <KPICard label="Avg Safety Score"    value={`${avgSafety}%`} />
        <KPICard label="Avg Completion Rate" value={`${avgCompletion}%`} />
        <KPICard label="Expired Licenses"    value={expiredCount} />
        <KPICard label="Total Complaints"    value={totalComplaints} />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' }}>
        <input placeholder="🔍  Search by name or license #…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '9px 14px', fontSize: 13, background: '#fff', color: '#2C1810', fontFamily: 'inherit', outline: 'none' }} />
        <select value={filterExp} onChange={e => setFilterExp(e.target.value as any)}
          style={{ border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '9px 14px', fontSize: 13, background: '#fff', color: '#2C1810', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
          {['All', 'Valid', 'Expired'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          style={{ border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '9px 14px', fontSize: 13, background: '#fff', color: '#2C1810', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
          <option value="safetyScore">Sort: Safety Score</option>
          <option value="completionRate">Sort: Completion Rate</option>
          <option value="complaints">Sort: Complaints</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FFF4EA' }}>
              {['Driver', 'License #', 'Expiry', 'Completion Rate', 'Safety Score', 'Complaints', 'Status', 'On Duty'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8B5E52', borderBottom: '2px solid #EDDCC6', whiteSpace: 'nowrap' as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const expired     = new Date(d.licenseExpiry) < today;
              const expiringSoon = !expired && new Date(d.licenseExpiry) < new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
              const s = statusMap[d.status] || statusMap['off_duty'];
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid #EDDCC6', background: expired ? 'rgba(191,70,70,0.04)' : i % 2 === 0 ? '#fff' : '#FEFAF6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: expired ? '#BF4646' : '#2C1810', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{d.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: expired ? '#BF4646' : '#2C1810' }}>{d.name}</div>
                        <div style={{ fontSize: 10, color: '#8B5E52' }}>{d.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><code style={{ background: '#EDDCC6', padding: '2px 8px', borderRadius: 5, fontSize: 11 }}>{d.licenseNumber}</code></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 700, color: expired ? '#BF4646' : expiringSoon ? '#E8A838' : '#2C1810' }}>{d.licenseExpiry}</span>
                    {expired     && <div style={{ fontSize: 10, color: '#BF4646', fontWeight: 700, marginTop: 1 }}>EXPIRED</div>}
                    {expiringSoon && !expired && <div style={{ fontSize: 10, color: '#E8A838', fontWeight: 700, marginTop: 1 }}>EXPIRING SOON</div>}
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: 140 }}>
                    <ScoreBar value={d.completionRate} color={d.completionRate >= 85 ? '#7EACB5' : '#E8A838'} />
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: 140 }}>
                    <ScoreBar value={d.safetyScore} color={d.safetyScore >= 80 ? '#7EACB5' : '#BF4646'} />
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' as const }}>
                    <span style={{ background: d.complaints === 0 ? '#7EACB5' : d.complaints <= 3 ? '#E8A838' : '#BF4646', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{d.complaints}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: s.bg, color: s.color, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const }}>{s.label}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => !expired && d.status !== 'on_trip' && toggleDriverDuty(d.id)} disabled={expired || d.status === 'on_trip'}
                      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: expired || d.status === 'on_trip' ? 'not-allowed' : 'pointer', background: d.status === 'active' ? '#7EACB5' : '#EDDCC6', position: 'relative', opacity: expired ? 0.4 : 1, padding: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: d.status === 'active' ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '36px 20px', color: '#8B5E52' }}>No drivers found.</div>}
      </div>
    </>
  );
}