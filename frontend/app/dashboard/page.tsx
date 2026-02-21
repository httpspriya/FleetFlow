'use client';
import { useStore } from '@/lib/store';

// ── Universal KPI Card — value always #2C1810 (dark) ─────────
const KPICard = ({ label, value, sub, icon }: { label: string; value: string | number; sub: string; icon: string }) => (
  <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: '#EDDCC6', borderRadius: '0 14px 0 80px', opacity: 0.5 }} />
    <div style={{ fontSize: 20, color: '#8B5E52', position: 'relative', zIndex: 1 }}>{icon}</div>
    <div style={{ fontSize: 36, fontWeight: 900, color: '#2C1810', fontFamily: "'Playfair Display',Georgia,serif", lineHeight: 1, position: 'relative', zIndex: 1 }}>{value}</div>
    <div style={{ fontSize: 14, color: '#2C1810', fontWeight: 700, position: 'relative', zIndex: 1 }}>{label}</div>
    <div style={{ fontSize: 12, color: '#8B5E52', position: 'relative', zIndex: 1 }}>{sub}</div>
  </div>
);

export default function Dashboard() {
  const { vehicles, trips, drivers, isLoading } = useStore();
  const activeFleet     = vehicles.filter(v => v.status !== 'out_of_service').length;
  const maintenanceAlerts = vehicles.filter(v => v.status === 'in_shop').length;
  const onTrip          = vehicles.filter(v => v.status === 'on_trip');
  const utilization     = Math.round((onTrip.length / Math.max(activeFleet, 1)) * 100);
  const pendingCargo    = trips.filter(t => t.status === 'draft').length;

  const statusColor: Record<string, { bg: string; color: string; label: string }> = {
    on_trip:        { bg: '#BF4646', color: '#fff', label: 'On Trip' },
    available:      { bg: '#7EACB5', color: '#fff', label: 'Available' },
    in_shop:        { bg: '#8B5E52', color: '#fff', label: 'In Shop' },
    out_of_service: { bg: '#bbb',    color: '#fff', label: 'Out of Service' },
  };

  if (isLoading) {
    return <div style={{ padding: 24, color: '#8B5E52' }}>Loading fleet data…</div>;
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, color: '#2C1810', marginBottom: 6, fontWeight: 900 }}>Command Center</h1>
      <p style={{ color: '#8B5E52', marginBottom: 28, fontSize: 14 }}>
        Live fleet overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KPICard label="Active Fleet"       value={activeFleet}      sub="vehicles operational"     icon="◈" />
        <KPICard label="Maintenance Alerts" value={maintenanceAlerts} sub={maintenanceAlerts > 0 ? 'requires attention' : 'all clear'} icon="⚙" />
        <KPICard label="Utilization Rate"   value={`${utilization}%`} sub="fleet efficiency"         icon="▦" />
        <KPICard label="Pending Cargo"      value={pendingCargo}     sub="trips awaiting dispatch"  icon="◎" />
      </div>

      {/* Live Table */}
      <div style={{ background: '#fff', border: '1.5px solid #EDDCC6', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 17, color: '#2C1810', marginBottom: 18 }}>Vehicles Currently On Trip</h3>
        {onTrip.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8B5E52' }}>No vehicles on trip right now.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Vehicle', 'License', 'Type', 'Route', 'Driver', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8B5E52', borderBottom: '2px solid #EDDCC6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {onTrip.map(v => {
                const trip   = trips.find(t => t.vehicleId === v.id && t.status === 'dispatched');
                const driver = trip ? drivers.find(d => d.id === trip.driverId) : null;
                const s      = statusColor[v.status];
                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid #EDDCC6' }}>
                    <td style={{ padding: '13px 14px', fontWeight: 700, color: '#2C1810' }}>{v.name}</td>
                    <td style={{ padding: '13px 14px' }}><code style={{ background: '#EDDCC6', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>{v.licensePlate}</code></td>
                    <td style={{ padding: '13px 14px', color: '#8B5E52' }}>{v.type}</td>
                    <td style={{ padding: '13px 14px', color: '#8B5E52', fontSize: 12 }}>{trip ? `${trip.origin} → ${trip.destination}` : '—'}</td>
                    <td style={{ padding: '13px 14px' }}>{driver?.name || '—'}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}