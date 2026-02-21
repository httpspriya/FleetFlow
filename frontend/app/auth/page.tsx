'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const roles = ['Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'];
const onlyLettersSpaces = (v: string) => v.replace(/[^a-zA-Z\s]/g, '');

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function isStrongPassword(pw: string) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
}

// ── Field ─────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', error, disabled, filter, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string;
  disabled?: boolean; filter?: (v: string) => string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder} value={value} disabled={disabled}
          onChange={e => onChange(filter ? filter(e.target.value) : e.target.value)}
          style={{ width: '100%', border: `1.5px solid ${error ? '#BF4646' : disabled ? '#E8DDD4' : '#EDDCC6'}`, borderRadius: 9, padding: isPassword ? '11px 42px 11px 13px' : '11px 13px', fontSize: 14, background: disabled ? '#F5EDE4' : '#fff', color: disabled ? '#aaa' : '#2C1810', outline: 'none', fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'text', boxSizing: 'border-box' as const }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B5E52', fontSize: 14, padding: 0 }}>
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {hint && !error && <div style={{ marginTop: 4, fontSize: 11, color: '#8B5E52' }}>{hint}</div>}
      {error && <div style={{ marginTop: 5, fontSize: 12, color: '#BF4646', fontWeight: 600, display: 'flex', gap: 4 }}><span>⚠</span><span>{error}</span></div>}
    </div>
  );
}

// ── LEFT PANEL content per tab ────────────────────────────────
const LEFT_CONTENT = {
  login: {
    heading: <>Fleet<span style={{ color: '#BF4646' }}>Flow</span></>,
    sub: 'Sign in to manage your fleet, track vehicles, and stay on top of every trip.',
    features: ['Real-time vehicle tracking', 'Automated maintenance alerts', 'Driver compliance monitoring', 'ROI & fuel analytics'],
  },
  register: {
    heading: <>Join<br /><span style={{ color: '#BF4646' }}>FleetFlow</span></>,
    sub: 'Create your account and get full access to the fleet management dashboard.',
    features: ['Manage vehicles & drivers', 'Dispatch trips with smart rules', 'Track safety & compliance', 'Export reports anytime'],
  },
};

// ── LOGIN ─────────────────────────────────────────────────────
function LoginForm({ onSuccess, onGoRegister }: { onSuccess: () => void; onGoRegister: () => void }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState<{ email?: string; password?: string; auth?: string }>({});
  const [touched,  setTouched]  = useState<{ email?: boolean; password?: boolean }>({});
  const [loading,  setLoading]  = useState(false);

  const emailValid     = isValidEmail(email);
  const passwordLocked = !emailValid;

  const valEmail = (v: string) => !v.trim() ? 'Email address is required.' : !isValidEmail(v) ? 'Enter a valid email address (e.g. you@fleet.com).' : '';
  const valPass  = (v: string) => !v ? 'Password is required.' : v.length < 6 ? 'Password must be at least 6 characters.' : '';

  const handleSubmit = async () => {
    const eErr = valEmail(email);
    const pErr = valPass(password);
    setErrors({ email: eErr, password: pErr });
    setTouched({ email: true, password: true });
    if (eErr || pErr) return;
    setLoading(true);
    setErrors((e) => ({ ...e, auth: undefined }));
    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setErrors({ auth: msg === 'Invalid credentials' ? 'Email or password is incorrect.' : msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {errors.auth && (
        <div style={{ background: 'rgba(191,70,70,0.1)', border: '1.5px solid #BF4646', borderRadius: 9, padding: '12px 14px', fontSize: 13, color: '#BF4646', fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
          🔒 {errors.auth}
        </div>
      )}

      <Field label="Email Address" type="email" placeholder="you@fleet.com" value={email}
        error={touched.email ? errors.email : undefined}
        onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: valEmail(v), auth: undefined })); setTouched(t => ({ ...t, email: true })); }} />

      <div style={{ opacity: passwordLocked ? 0.45 : 1, transition: 'opacity 0.2s' }}>
        <Field label="Password" type="password"
          placeholder={passwordLocked ? 'Enter valid email first' : '••••••••'}
          value={password} disabled={passwordLocked}
          error={touched.password && !passwordLocked ? errors.password : undefined}
          onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: valPass(v), auth: undefined })); setTouched(t => ({ ...t, password: true })); }} />
      </div>


      <button onClick={handleSubmit} disabled={loading}
        style={{ marginTop: 4, padding: '14px', fontSize: 15, borderRadius: 10, background: loading ? '#e0a0a0' : '#BF4646', color: '#fff', border: 'none', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>

      {/* ── Bottom link to Register ── */}
      <p style={{ textAlign: 'center', fontSize: 13, color: '#8B5E52', marginTop: 4 }}>
        Don&apos;t have an account?{' '}
        <button onClick={onGoRegister}
          style={{ background: 'none', border: 'none', color: '#BF4646', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
          Register here
        </button>
      </p>
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────────
type RegForm = { name: string; email: string; password: string; confirm: string; role: string };
type RegErrors = Partial<Record<keyof RegForm, string>>;
const FIELD_ORDER: (keyof RegForm)[] = ['name', 'email', 'password', 'confirm', 'role'];
const emptyReg: RegForm = { name: '', email: '', password: '', confirm: '', role: 'Manager' };

function validateReg(f: RegForm): RegErrors {
  const e: RegErrors = {};
  if (!f.name.trim()) e.name = 'Full name is required.';
  else if (f.name.trim().length < 3) e.name = 'Name must be at least 3 characters.';
  else if (!/^[a-zA-Z\s]+$/.test(f.name.trim())) e.name = 'Name must contain letters only.';
  if (!f.email.trim()) e.email = 'Email address is required.';
  else if (!isValidEmail(f.email)) e.email = 'Enter a valid email address (e.g. you@fleet.com).';
  if (!f.password) e.password = 'Password is required.';
  else if (!isStrongPassword(f.password)) e.password = 'Min 8 characters with at least 1 letter and 1 number.';
  if (!f.confirm) e.confirm = 'Please confirm your password.';
  else if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  return e;
}

function firstInvalid(f: RegForm, errors: RegErrors) {
  for (let i = 0; i < FIELD_ORDER.length - 1; i++) {
    const k = FIELD_ORDER[i];
    if (!f[k] || errors[k]) return i;
  }
  return FIELD_ORDER.length;
}

function RegisterForm({ onSuccess, onGoLogin }: { onSuccess: () => void; onGoLogin: () => void }) {
  const { register } = useAuth();
  const [form,    setForm]    = useState<RegForm>(emptyReg);
  const [errors,  setErrors]  = useState<RegErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegForm, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState<string | null>(null);

  const currentErrors = validateReg(form);
  const unlockedUpTo  = firstInvalid(form, currentErrors);
  const isDisabled    = (k: keyof RegForm) => k !== 'role' && FIELD_ORDER.indexOf(k) > unlockedUpTo;

  const set = (k: keyof RegForm, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    setErrors(prev => ({ ...prev, [k]: validateReg(next)[k] }));
    setTouched(t => ({ ...t, [k]: true }));
    setAuthErr(null);
  };

  const showErr = (k: keyof RegForm) => touched[k] ? errors[k] : undefined;
  const progress = Math.min(unlockedUpTo / (FIELD_ORDER.length - 1), 1);

  const handleSubmit = async () => {
    const errs = validateReg(form);
    setErrors(errs);
    const all: any = {}; FIELD_ORDER.forEach(k => (all[k] = true)); setTouched(all);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setAuthErr(null);
    try {
      await register(form.email.trim(), form.password, form.role || 'Manager');
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setAuthErr(msg.includes('already') ? 'This email is already registered.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {authErr && (
        <div style={{ background: 'rgba(191,70,70,0.1)', border: '1.5px solid #BF4646', borderRadius: 9, padding: '12px 14px', fontSize: 13, color: '#BF4646', fontWeight: 700 }}>
          🔒 {authErr}
        </div>
      )}
      {/* Progress bar */}
      <div>
        <div style={{ height: 4, background: '#EDDCC6', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: '#BF4646', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <p style={{ fontSize: 11, color: '#8B5E52', marginTop: 4 }}>
          {unlockedUpTo >= FIELD_ORDER.length - 1 ? '✓ All fields valid — ready to register' : `Step ${Math.min(unlockedUpTo + 1, FIELD_ORDER.length - 1)} of ${FIELD_ORDER.length - 1}`}
        </p>
      </div>

      <Field label="1. Full Name" placeholder="e.g. Marcus Rivera" value={form.name}
        error={showErr('name')} filter={onlyLettersSpaces} disabled={isDisabled('name')}
        onChange={v => set('name', v)} />

      <Field label="2. Email Address" type="email" placeholder="you@fleet.com" value={form.email}
        error={showErr('email')} disabled={isDisabled('email')} onChange={v => set('email', v)} />

      <div>
        <Field label="3. Password" type="password"
          placeholder={isDisabled('password') ? 'Enter valid email first' : 'Min 8 chars + 1 number'}
          value={form.password} error={showErr('password')}
          hint="Must be at least 8 characters with 1 letter & 1 number"
          disabled={isDisabled('password')} onChange={v => set('password', v)} />
        {form.password && !isDisabled('password') && (
          <div style={{ marginTop: 6 }}>
            <div style={{ height: 3, background: '#EDDCC6', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, transition: 'width 0.3s, background 0.3s', width: form.password.length < 6 ? '25%' : form.password.length < 8 ? '50%' : isStrongPassword(form.password) ? '100%' : '75%', background: form.password.length < 6 ? '#BF4646' : form.password.length < 8 ? '#E8A838' : isStrongPassword(form.password) ? '#7EACB5' : '#E8A838' }} />
            </div>
            <div style={{ fontSize: 11, marginTop: 3, fontWeight: 600, color: isStrongPassword(form.password) ? '#7EACB5' : '#E8A838' }}>
              {form.password.length < 6 ? 'Too short' : form.password.length < 8 ? 'Weak — needs 8+ chars' : isStrongPassword(form.password) ? '✓ Strong password' : 'Add a number'}
            </div>
          </div>
        )}
      </div>

      <Field label="4. Confirm Password" type="password"
        placeholder={isDisabled('confirm') ? 'Set password first' : 'Re-enter your password'}
        value={form.confirm} error={showErr('confirm')}
        disabled={isDisabled('confirm')} onChange={v => set('confirm', v)} />

      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8B5E52', letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 6 }}>5. Role</label>
        <select value={form.role} onChange={e => set('role', e.target.value)}
          style={{ width: '100%', border: '1.5px solid #EDDCC6', borderRadius: 9, padding: '10px 13px', fontSize: 14, background: '#fff', color: '#2C1810', outline: 'none', fontFamily: 'inherit' }}>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        style={{ marginTop: 4, padding: '14px', fontSize: 15, borderRadius: 10, background: loading ? '#e0a0a0' : '#BF4646', color: '#fff', border: 'none', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: Object.keys(currentErrors).length > 0 ? 0.7 : 1, transition: 'all 0.2s' }}>
        {loading ? 'Creating account…' : 'Create Account →'}
      </button>

      {/* ── Bottom link back to Login ── */}
      <p style={{ textAlign: 'center', fontSize: 13, color: '#8B5E52', marginTop: 4 }}>
        Already have an account?{' '}
        <button onClick={onGoLogin}
          style={{ background: 'none', border: 'none', color: '#BF4646', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
          Sign in here
        </button>
      </p>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  const lc = LEFT_CONTENT[tab];

  return (
    <div style={{ minHeight: '100vh', background: '#FFF4EA', display: 'flex', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* ── Left Pane ── */}
      <div style={{ width: '44%', background: '#2C1810', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 52, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 20% 80%, rgba(191,70,70,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(126,172,181,0.2) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 340 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 52, fontWeight: 900, color: '#FFF4EA', letterSpacing: '-0.04em', lineHeight: 1.05, transition: 'all 0.3s' }}>
            {lc.heading}
          </div>
          <div style={{ width: 48, height: 3, background: '#BF4646', margin: '20px auto', borderRadius: 2 }} />
          <p style={{ color: '#EDDCC6', fontSize: 15, lineHeight: 1.75 }}>{lc.sub}</p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 13 }}>
            {lc.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#EDDCC6', fontSize: 14 }}>
                <span style={{ color: '#7EACB5', fontSize: 15 }}>◆</span>{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Pane ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 52px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Title — changes per tab, NO toggle buttons */}
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, color: '#2C1810', marginBottom: 6 }}>
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: '#8B5E52', fontSize: 13, marginBottom: 28 }}>
            {tab === 'login'
              ? 'Sign in to your fleet dashboard.'
              : 'Fill in the details below to get started.'}
          </p>

          {tab === 'login'
            ? <LoginForm    onSuccess={handleSuccess} onGoRegister={() => setTab('register')} />
            : <RegisterForm onSuccess={handleSuccess} onGoLogin={() => setTab('login')} />
          }
        </div>
      </div>
    </div>
  );
}