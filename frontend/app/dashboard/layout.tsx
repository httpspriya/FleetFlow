'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { path: '/dashboard',   label: 'Command Center',   icon: '⬡' },
  { path: '/vehicles',    label: 'Vehicle Registry', icon: '◈' },
  { path: '/trips',       label: 'Trip Dispatcher',  icon: '◎' },
  { path: '/maintenance', label: 'Maintenance Logs', icon: '⚙' },
  { path: '/expenses',    label: 'Expense & Fuel',   icon: '◫' },
  { path: '/drivers',     label: 'Driver Profiles',  icon: '◉' },
  { path: '/reports',     label: 'Analytics',        icon: '▦' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { role } = useStore();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth');
  }, [isAuthenticated, router]);

  const handleSignOut = () => {
    logout();
    router.push('/auth');
  };

  const currentPage = NAV_LINKS.find(l => l.path === pathname);

  if (!isAuthenticated) return null;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#FFF4EA', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FFF4EA; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #EDDCC6; }
        ::-webkit-scrollbar-thumb { background: #BF4646; border-radius: 4px; }
        button { transition: opacity 0.15s; }
        button:hover { opacity: 0.88; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: 224, background: '#EDDCC6', height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', borderRight: '2px solid rgba(44,24,16,0.1)', zIndex: 200 }}>
        <div style={{ padding: '22px 18px 18px', borderBottom: '1.5px solid rgba(44,24,16,0.12)' }}>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 21, fontWeight: 900, color: '#BF4646', letterSpacing: '-0.02em' }}>
            Fleet<span style={{ color: '#2C1810' }}>Flow</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginTop: 3 }}>{role}</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_LINKS.map(l => {
            const active = pathname === l.path;
            return (
              <button key={l.path} onClick={() => router.push(l.path)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 9, border: 'none', background: active ? '#BF4646' : 'transparent', color: active ? '#fff' : '#2C1810', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', marginBottom: 2, fontFamily: 'inherit', textAlign: 'left' as const }}>
                <span style={{ fontSize: 14, width: 20, textAlign: 'center' as const }}>{l.icon}</span>
                <span>{l.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '12px 18px', borderTop: '1.5px solid rgba(44,24,16,0.12)', fontSize: 11, color: '#8B5E52' }}>FleetFlow v2.1.0</div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: 224, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ background: '#FFF4EA', borderBottom: '1.5px solid #EDDCC6', padding: '0 28px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: '#8B5E52' }}>{currentPage?.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#2C1810' }}>{currentPage?.label || 'Dashboard'}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#8B5E52' }}>Logged in as <strong style={{ color: '#2C1810' }}>{role}</strong></div>
            <button onClick={handleSignOut} style={{ background: 'none', border: '1.5px solid #EDDCC6', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#8B5E52', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Sign Out</button>
          </div>
        </header>
        <main style={{ flex: 1, padding: '26px 32px', overflowX: 'hidden' }}>{children}</main>
      </div>
    </div>
  );
}