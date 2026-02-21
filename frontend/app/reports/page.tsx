'use client';
import { useStore } from '@/lib/store';
import { useFleetSummary } from '@/lib/hooks/use-fleet-data';

// ── Universal KPI Card — value always #2C1810 ─────────────────
const KPICard = ({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: string }) => (
  <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden', flex: 1 }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, background: '#EDDCC6', borderRadius: '0 14px 0 70px', opacity: 0.5 }} />
    <div style={{ fontSize: 22, marginBottom: 8, position: 'relative', zIndex: 1 }}>{icon}</div>
    <div style={{ fontSize: 30, fontWeight: 900, color: '#2C1810', fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1, position: 'relative', zIndex: 1 }}>{value}</div>
    <div style={{ fontSize: 13, color: '#2C1810', fontWeight: 700, marginTop: 5, position: 'relative', zIndex: 1 }}>{label}</div>
    <div style={{ fontSize: 11, color: '#8B5E52', marginTop: 2, position: 'relative', zIndex: 1 }}>{sub}</div>
  </div>
);

// ── Multi-Line Chart (Fuel Efficiency Trend) ──────────────────
function MultiLineChart() {
  const W = 400; const H = 200;
  const pad = { top: 20, right: 20, bottom: 36, left: 40 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const series = [
    { label: 'Titan Hauler', values: [3.8, 4.0, 4.1, 4.2, 4.3], color: '#BF4646' },
    { label: 'Swift Runner', values: [9.2, 9.5, 9.7, 9.8, 9.9], color: '#7EACB5' },
    { label: 'Road Monarch', values: [3.5, 3.6, 3.7, 3.9, 3.9], color: '#8B5E52' },
    { label: 'City Drifter', values: [11.8, 12.0, 12.2, 12.4, 12.5], color: '#2C1810' },
  ];

  const allVals = series.flatMap(s => s.values);
  const maxV = Math.max(...allVals) + 1;
  const minV = Math.min(...allVals) - 0.5;
  const range = maxV - minV;

  const px = (i: number) => pad.left + (i / (labels.length - 1)) * iW;
  const py = (v: number) => pad.top + iH - ((v - minV) / range) * iH;

  const gridVals = [minV, minV + range * 0.33, minV + range * 0.66, maxV];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      {/* Grid */}
      {gridVals.map((v, i) => {
        const yy = py(v);
        return (
          <g key={i}>
            <line x1={pad.left} y1={yy} x2={pad.left + iW} y2={yy} stroke="#EDDCC6" strokeWidth="1" strokeDasharray="4,3" />
            <text x={pad.left - 5} y={yy + 4} textAnchor="end" fontSize="9" fill="#8B5E52">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {/* X axis */}
      {labels.map((l, i) => (
        <text key={l} x={px(i)} y={pad.top + iH + 18} textAnchor="middle" fontSize="10" fill="#8B5E52">{l}</text>
      ))}
      {/* Lines */}
      {series.map(s => {
        const pts = s.values.map((v, i) => `${px(i)},${py(v)}`).join(' ');
        return (
          <g key={s.label}>
            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {s.values.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r="4" fill={s.color} stroke="#fff" strokeWidth="2" />)}
          </g>
        );
      })}
      {/* Legend at bottom */}
      {series.map((s, i) => (
        <g key={s.label} transform={`translate(${pad.left + i * 92}, ${H - 6})`}>
          <rect width="12" height="3" y="-1" fill={s.color} rx="1" />
          <text x="15" y="3" fontSize="8.5" fill="#8B5E52">{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Bar Chart (Top 5 Costliest) ───────────────────────────────
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 360; const H = 190;
  const pad = { top: 20, right: 16, bottom: 32, left: 52 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;
  const maxV = Math.max(...data.map(d => d.value)) * 1.15;
  const barW = (iW / data.length) * 0.6;
  const step = iW / data.length;

  const gridVals = [0, maxV * 0.25, maxV * 0.5, maxV * 0.75, maxV];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      {/* Grid */}
      {gridVals.map((v, i) => {
        const yy = pad.top + iH - (v / maxV) * iH;
        return (
          <g key={i}>
            <line x1={pad.left} y1={yy} x2={pad.left + iW} y2={yy} stroke="#EDDCC6" strokeWidth="1" strokeDasharray="4,3" />
            <text x={pad.left - 5} y={yy + 4} textAnchor="end" fontSize="9" fill="#8B5E52">
              {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const bh = (d.value / maxV) * iH;
        const bx = pad.left + i * step + (step - barW) / 2;
        const by = pad.top + iH - bh;
        const isMax = d.value === Math.max(...data.map(x => x.value));
        return (
          <g key={d.label}>
            <rect x={bx} y={by} width={barW} height={bh} fill={isMax ? '#BF4646' : '#7EACB5'} rx="3" />
            <text x={bx + barW / 2} y={pad.top + iH + 18} textAnchor="middle" fontSize="9.5" fill="#8B5E52">{d.label}</text>
            <text x={bx + barW / 2} y={by - 5} textAnchor="middle" fontSize="9" fill={isMax ? '#BF4646' : '#2C1810'} fontWeight="bold">
              {d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value}
            </text>
          </g>
        );
      })}
      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + iH} stroke="#EDDCC6" strokeWidth="1.5" />
      <line x1={pad.left} y1={pad.top + iH} x2={pad.left + iW} y2={pad.top + iH} stroke="#EDDCC6" strokeWidth="1.5" />
    </svg>
  );
}

// ── Monthly data ──────────────────────────────────────────────
const monthlyData = [
  { month: 'Oct', revenue: 1400000, fuelCost: 520000, maintenance: 180000 },
  { month: 'Nov', revenue: 1550000, fuelCost: 580000, maintenance: 140000 },
  { month: 'Dec', revenue: 1700000, fuelCost: 610000, maintenance: 220000 },
  { month: 'Jan', revenue: 1700000, fuelCost: 600000, maintenance: 200000 },
  { month: 'Feb', revenue: 1820000, fuelCost: 640000, maintenance: 160000 },
];

const costliestData = [
  { label: 'VAN-03', value: 12000 },
  { label: 'TRK-77', value: 47000 },
  { label: 'LGT-11', value: 8500 },
  { label: 'TRK-66', value: 22000 },
  { label: 'VAN-00', value: 6000 },
];

// ── Main Page ─────────────────────────────────────────────────
export default function Reports() {
  const { vehicles, trips } = useStore();
  const { data: fleetSummary } = useFleetSummary();
  const completedTrips  = trips.filter(t => t.status === 'completed');
  const totalDistance   = completedTrips.reduce((s, t) => s + (t.distance || 0), 0);
  const activeFleet     = vehicles.filter(v => v.status !== 'out_of_service').length;
  const onTripCount     = vehicles.filter(v => v.status === 'on_trip').length;
  const utilization     = Math.round((onTripCount / Math.max(activeFleet, 1)) * 100);
  const fuelArr         = vehicles.map(v => v.fuelEfficiency).filter(Boolean);
  const roiArr          = vehicles.map(v => v.roi).filter(Boolean);
  const maxFuel         = fuelArr.length ? Math.max(...fuelArr) : 1;
  const maxRoi          = roiArr.length ? Math.max(...roiArr) : 1;
  const fin             = fleetSummary?.financials;

  const exportCSV = () => {
    const rows = [['Month', 'Revenue (₹)', 'Fuel Cost (₹)', 'Maintenance (₹)', 'Net Profit (₹)']];
    monthlyData.forEach(m => rows.push([m.month, String(m.revenue), String(m.fuelCost), String(m.maintenance), String(m.revenue - m.fuelCost - m.maintenance)]));
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a    = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'fleetflow_report.csv'; a.click();
  };

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: '#2C1810', marginBottom: 4, fontWeight: 900 }}>Operational Analytics & Financial Reports</h1>
          <p style={{ color: '#8B5E52', fontSize: 13 }}>{totalDistance.toLocaleString()} km completed · {completedTrips.length} trips done</p>
        </div>
        <button onClick={exportCSV} style={{ background: '#7EACB5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>↓ Export CSV</button>
      </div>

      {/* KPI Cards — all values #2C1810 */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' as const }}>
        <KPICard icon="⛽" label="Total Fuel Cost"  value={fin ? `₹${(Number(fin.fuelCost) / 100000).toFixed(2)} L` : '—'} sub="All time" />
        <KPICard icon="📈" label="Net Profit"       value={fin ? `₹${(Number(fin.netProfit) / 100000).toFixed(2)} L` : '—'} sub="Revenue − costs" />
        <KPICard icon="▦"  label="Utilization Rate" value={`${utilization}%`} sub="Fleet efficiency" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, padding: '20px 18px' }}>
          <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: '#2C1810', margin: '0 0 4px' }}>Fuel Efficiency Trend (km/L)</h3>
          <p style={{ fontSize: 11, color: '#8B5E52', marginBottom: 14 }}>Per vehicle · Oct – Feb</p>
          <MultiLineChart />
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, padding: '20px 18px' }}>
          <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: '#2C1810', margin: '0 0 4px' }}>Top 5 Costliest Vehicles</h3>
          <p style={{ fontSize: 11, color: '#8B5E52', marginBottom: 14 }}>By maintenance cost · highest bar in red</p>
          <BarChart data={costliestData} />
        </div>
      </div>

      {/* Fuel Efficiency bars */}
      <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: '#2C1810', marginBottom: 16 }}>Vehicle Fuel Efficiency (km/L)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...vehicles].sort((a, b) => b.fuelEfficiency - a.fuelEfficiency).map(v => (
            <div key={v.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2C1810' }}>{v.name} <span style={{ color: '#8B5E52', fontWeight: 400 }}>({v.licensePlate})</span></span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#2C1810' }}>{v.fuelEfficiency} km/L</span>
              </div>
              <div style={{ height: 8, background: '#EDDCC6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(v.fuelEfficiency / maxFuel) * 100}%`, background: '#7EACB5', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI bars */}
      <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: '#2C1810', marginBottom: 16 }}>Vehicle ROI (%)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...vehicles].sort((a, b) => b.roi - a.roi).map(v => (
            <div key={v.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2C1810' }}>{v.name} <span style={{ color: '#8B5E52', fontWeight: 400 }}>({v.licensePlate})</span></span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#2C1810' }}>{v.roi}%</span>
              </div>
              <div style={{ height: 8, background: '#EDDCC6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(v.roi / maxRoi) * 100}%`, background: v.roi < 12 ? '#BF4646' : '#7EACB5', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary Table */}
      <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '2px solid #EDDCC6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, color: '#2C1810', margin: 0 }}>Financial Summary of Month</h3>
          <span style={{ fontSize: 11, color: '#8B5E52', fontWeight: 600 }}>Oct 2024 – Feb 2025</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FFF4EA' }}>
                {['Month', 'Revenue', 'Fuel Cost', 'Maintenance', 'Net Profit', 'Margin'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '11px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8B5E52', borderBottom: '1.5px solid #EDDCC6', whiteSpace: 'nowrap' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m, i) => {
                const net    = m.revenue - m.fuelCost - m.maintenance;
                const margin = ((net / m.revenue) * 100).toFixed(1);
                const isLast = i === monthlyData.length - 1;
                return (
                  <tr key={m.month} style={{ borderBottom: '1px solid #EDDCC6', background: isLast ? 'rgba(126,172,181,0.06)' : i % 2 === 0 ? '#fff' : '#FEFAF6' }}>
                    <td style={{ padding: '12px 18px', fontWeight: 700, color: '#2C1810' }}>{m.month}{isLast ? ' ★' : ''}</td>
                    <td style={{ padding: '12px 18px', fontWeight: 600, color: '#2C1810' }}>₹{(m.revenue / 100000).toFixed(1)} L</td>
                    <td style={{ padding: '12px 18px', color: '#2C1810' }}>₹{(m.fuelCost / 100000).toFixed(1)} L</td>
                    <td style={{ padding: '12px 18px', color: '#2C1810' }}>₹{(m.maintenance / 100000).toFixed(1)} L</td>
                    <td style={{ padding: '12px 18px', fontWeight: 800, color: '#2C1810' }}>₹{(net / 100000).toFixed(1)} L</td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ background: Number(margin) >= 45 ? '#7EACB5' : '#E8A838', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{margin}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}