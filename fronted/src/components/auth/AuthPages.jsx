import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Spinner, FormGroup } from '../common/UI';

const ROUTES = { ADMIN: '/admin/dashboard', USER: '/user/stores', STORE_OWNER: '/owner/dashboard' };

function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⭐</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>StoreRater</h1>
          <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>Rate. Discover. Share.</p>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{title}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form);
      navigate(ROUTES[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      {error && <Alert type="error">{error}</Alert>}
      <form onSubmit={submit}>
        <FormGroup label="Email address">
          <input className="form-control" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => set('email', e.target.value)} required />
        </FormGroup>
        <FormGroup label="Password">
          <input className="form-control" type="password" placeholder="Your password"
            value={form.password} onChange={e => set('password', e.target.value)} required />
        </FormGroup>
        <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
          {loading ? <Spinner /> : 'Sign In'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Register</Link>
      </p>
      <div className="alert alert-info" style={{ marginTop: 16 }}>
        <span>💡</span>
        <div>
          <strong>Demo Admin:</strong><br />
          admin@storerating.com / Admin@123
        </div>
      </div>
    </AuthCard>
  );
}

// Validation helpers
const specialCharRegex = new RegExp('[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>/?]');
const validators = {
  name: v => !v ? 'Name is required'
    : v.length < 20 ? 'Name must be at least 20 characters'
    : v.length > 60 ? 'Name must be at most 60 characters' : '',
  email: v => !v ? 'Email is required'
    : !/^[^\s@]+@[^^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : '',
  address: v => !v ? 'Address is required'
    : v.length > 400 ? 'Address must be at most 400 characters' : '',
  password: v => !v ? 'Password is required'
    : v.length < 8 || v.length > 16 ? 'Password must be 8–16 characters'
    : !/[A-Z]/.test(v) ? 'Must include at least one uppercase letter'
    : !specialCharRegex.test(v) ? 'Must include at least one special character' : '',
};

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: validators[k]?.(v) || '' }));
  };

  const validate = () => {
    const errs = {};
    Object.keys(validators).forEach(k => { errs[k] = validators[k](form[k]); });
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const submit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(''); setLoading(true);
    try {
      await register(form);
      navigate('/user/stores');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Create account" subtitle="Join StoreRater and start rating">
      {apiError && <Alert type="error">{apiError}</Alert>}
      <form onSubmit={submit}>
        <FormGroup label="Full Name" error={errors.name} hint="Min 20, max 60 characters">
          <input className={`form-control ${errors.name ? 'error' : ''}`} placeholder="Your full name (min 20 chars)"
            value={form.name} onChange={e => set('name', e.target.value)} />
        </FormGroup>
        <FormGroup label="Email Address" error={errors.email}>
          <input className={`form-control ${errors.email ? 'error' : ''}`} type="email" placeholder="you@example.com"
            value={form.email} onChange={e => set('email', e.target.value)} />
        </FormGroup>
        <FormGroup label="Address" error={errors.address} hint="Max 400 characters">
          <textarea className={`form-control ${errors.address ? 'error' : ''}`} rows={2} placeholder="Your full address"
            value={form.address} onChange={e => set('address', e.target.value)} />
        </FormGroup>
        <FormGroup label="Password" error={errors.password} hint="8–16 chars, 1 uppercase, 1 special character">
          <input className={`form-control ${errors.password ? 'error' : ''}`} type="password" placeholder="Create a strong password"
            value={form.password} onChange={e => set('password', e.target.value)} />
        </FormGroup>
        <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
          {loading ? <Spinner /> : 'Create Account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</Link>
      </p>
    </AuthCard>
  );
}