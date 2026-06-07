import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { AppLayout } from '../layout/Layout';
import { Spinner, Alert, RoleBadge, StarDisplay, SortTh, Pagination, EmptyState, Modal, FormGroup } from '../common/UI';

// ─── Validation ─────────────────────────────────────────────────────────────
const specialCharRegex = new RegExp('[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>/?]');
const validators = {
  name:     v => !v ? 'Required' : v.length < 20 ? 'Min 20 chars' : v.length > 60 ? 'Max 60 chars' : '',
  email:    v => !v ? 'Required' : !/^[^\s@]+@[^^\s@]+\.[^\s@]+$/.test(v) ? 'Invalid email' : '',
  address:  v => !v ? 'Required' : v.length > 400 ? 'Max 400 chars' : '',
  password: v => !v ? 'Required'
    : v.length < 8 || v.length > 16 ? '8–16 chars'
    : !/[A-Z]/.test(v) ? 'Need 1 uppercase'
    : !specialCharRegex.test(v) ? 'Need 1 special char' : '',
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout title="Dashboard"><div className="loading-page"><Spinner dark />Loading...</div></AppLayout>;

  const cards = [
    { icon: '👥', label: 'Total Users',      val: stats?.totalUsers,      bg: '#EEF2FF', color: '#4F46E5' },
    { icon: '🏪', label: 'Total Stores',     val: stats?.totalStores,     bg: '#F0FDF4', color: '#10B981' },
    { icon: '⭐', label: 'Total Ratings',    val: stats?.totalRatings,    bg: '#FFFBEB', color: '#F59E0B' },
    { icon: '🛡️', label: 'Admins',           val: stats?.totalAdmins,     bg: '#FDF4FF', color: '#9333EA' },
    { icon: '🏬', label: 'Store Owners',     val: stats?.totalStoreOwners, bg: '#FFF7ED', color: '#EA580C' },
    { icon: '👤', label: 'Normal Users',     val: stats?.totalNormalUsers, bg: '#F0F9FF', color: '#0EA5E9' },
  ];

  return (
    <AppLayout title="Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 className="page-title">System Overview</h2>
        <p className="page-subtitle">Platform statistics at a glance</p>
      </div>
      <div className="grid-3">
        {cards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className="stat-val">{c.val?.toLocaleString() ?? '—'}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

// ─── Users Table ─────────────────────────────────────────────────────────────
export function AdminUsers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name:'', email:'', address:'', role:'' });
  const [sort, setSort] = useState({ sortBy:'name', sortDir:'asc' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    adminApi.getUsers({ ...filters, ...sort, page, size: 10 })
      .then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [filters, sort, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSort = field => setSort(s =>
    ({ sortBy: field, sortDir: s.sortBy === field && s.sortDir === 'asc' ? 'desc' : 'asc' }));

  const showUser = id => adminApi.getUser(id).then(r => setSelected(r.data.data));

  return (
    <AppLayout title="User Management">
      <div style={{ marginBottom: 20, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div><h2 className="page-title">All Users</h2><p className="page-subtitle">View and filter all registered users</p></div>
      </div>

      {/* Filters */}
      <div className="card card-sm" style={{ marginBottom: 20 }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          {[['name','Name'],['email','Email'],['address','Address']].map(([k,l]) => (
            <div className="form-group" key={k} style={{ marginBottom: 0, minWidth: 160, flex: 1 }}>
              <label className="form-label">{l}</label>
              <input className="form-control" placeholder={`Filter by ${l.toLowerCase()}`}
                value={filters[k]} onChange={e => { setFilters(f => ({...f,[k]:e.target.value})); setPage(0); }} />
            </div>
          ))}
          <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
            <label className="form-label">Role</label>
            <select className="form-control" value={filters.role}
              onChange={e => { setFilters(f => ({...f,role:e.target.value})); setPage(0); }}>
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-page"><Spinner dark /></div> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <SortTh label="Name"    field="name"    {...sort} onSort={handleSort} />
                    <SortTh label="Email"   field="email"   {...sort} onSort={handleSort} />
                    <SortTh label="Address" field="address" {...sort} onSort={handleSort} />
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content?.length ? data.content.map(u => (
                    <tr key={u.id}>
                      <td><span style={{fontWeight:500}}>{u.name}</span></td>
                      <td style={{color:'var(--muted)'}}>{u.email}</td>
                      <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--muted)'}}>{u.address}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => showUser(u.id)}>View</button></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5}><EmptyState icon="👥" title="No users found" /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={data?.totalPages || 0} onChange={setPage} />
          </>
        )}
      </div>

      {selected && (
        <Modal title="User Details" onClose={() => setSelected(null)}>
          <div style={{ display:'grid', gap:14 }}>
            {[['Name',selected.name],['Email',selected.email],['Address',selected.address]].map(([l,v]) => (
              <div key={l}><div style={{fontSize:12,color:'var(--muted)',marginBottom:2}}>{l}</div><div style={{fontWeight:500}}>{v}</div></div>
            ))}
            <div><div style={{fontSize:12,color:'var(--muted)',marginBottom:2}}>Role</div><RoleBadge role={selected.role} /></div>
            {selected.role === 'STORE_OWNER' && (
              <div><div style={{fontSize:12,color:'var(--muted)',marginBottom:2}}>Store Rating</div><StarDisplay value={selected.storeRating} /></div>
            )}
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}

// ─── Stores Table ─────────────────────────────────────────────────────────────
export function AdminStores() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name:'', email:'', address:'' });
  const [sort, setSort] = useState({ sortBy:'name', sortDir:'asc' });
  const [page, setPage] = useState(0);

  const fetch = useCallback(() => {
    setLoading(true);
    adminApi.getStores({ ...filters, ...sort, page, size: 10 })
      .then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [filters, sort, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSort = field => setSort(s =>
    ({ sortBy: field, sortDir: s.sortBy === field && s.sortDir === 'asc' ? 'desc' : 'asc' }));

  return (
    <AppLayout title="Store Management">
      <div style={{ marginBottom: 20, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div><h2 className="page-title">All Stores</h2><p className="page-subtitle">View and manage registered stores</p></div>
      </div>

      <div className="card card-sm" style={{ marginBottom: 20 }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          {[['name','Name'],['email','Email'],['address','Address']].map(([k,l]) => (
            <div className="form-group" key={k} style={{ marginBottom: 0, minWidth: 160, flex: 1 }}>
              <label className="form-label">{l}</label>
              <input className="form-control" placeholder={`Filter by ${l.toLowerCase()}`}
                value={filters[k]} onChange={e => { setFilters(f => ({...f,[k]:e.target.value})); setPage(0); }} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-page"><Spinner dark /></div> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <SortTh label="Name"    field="name"    {...sort} onSort={handleSort} />
                    <SortTh label="Email"   field="email"   {...sort} onSort={handleSort} />
                    <SortTh label="Address" field="address" {...sort} onSort={handleSort} />
                    <th>Rating</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content?.length ? data.content.map(s => (
                    <tr key={s.id}>
                      <td><span style={{fontWeight:500}}>{s.name}</span></td>
                      <td style={{color:'var(--muted)'}}>{s.email}</td>
                      <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--muted)'}}>{s.address}</td>
                      <td><StarDisplay value={s.averageRating} /></td>
                      <td style={{color:'var(--muted)',fontSize:12}}>{s.ownerName || '—'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5}><EmptyState icon="🏪" title="No stores found" /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={data?.totalPages || 0} onChange={setPage} />
          </>
        )}
      </div>
    </AppLayout>
  );
}

// ─── Add User ─────────────────────────────────────────────────────────────────
export function AdminAddUser() {
  const [form, setForm] = useState({ name:'', email:'', address:'', password:'', role:'USER' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  const set = (k, v) => {
    setForm(f => ({...f,[k]:v}));
    if (validators[k]) setErrors(e => ({...e,[k]:validators[k](v)}));
  };

  const validate = () => {
    const errs = {};
    ['name','email','address','password'].forEach(k => { errs[k] = validators[k]?.(form[k]) || ''; });
    if (!form.role) errs.role = 'Required';
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const submit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(''); setSuccess(''); setLoading(true);
    try {
      await adminApi.createUser(form);
      setSuccess(`User "${form.name}" created successfully!`);
      setForm({ name:'', email:'', address:'', password:'', role:'USER' });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create user');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout title="Add User">
      <div style={{ maxWidth: 580 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 className="page-title">Add New User</h2>
          <p className="page-subtitle">Create a new user account on the platform</p>
        </div>
        <div className="card">
          {success && <Alert type="success">{success}</Alert>}
          {apiError && <Alert type="error">{apiError}</Alert>}
          <form onSubmit={submit}>
            <FormGroup label="Full Name" error={errors.name} hint="Min 20, max 60 characters">
              <input className={`form-control ${errors.name?'error':''}`} placeholder="Full legal name"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </FormGroup>
            <FormGroup label="Email Address" error={errors.email}>
              <input className={`form-control ${errors.email?'error':''}`} type="email" placeholder="user@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </FormGroup>
            <FormGroup label="Address" error={errors.address} hint="Max 400 characters">
              <textarea className={`form-control ${errors.address?'error':''}`} rows={2}
                value={form.address} onChange={e => set('address', e.target.value)} />
            </FormGroup>
            <div className="form-row">
              <FormGroup label="Password" error={errors.password} hint="8–16 chars, 1 uppercase, 1 special">
                <input className={`form-control ${errors.password?'error':''}`} type="password"
                  value={form.password} onChange={e => set('password', e.target.value)} />
              </FormGroup>
              <FormGroup label="Role" error={errors.role}>
                <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="USER">Normal User</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </FormGroup>
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? <Spinner /> : '➕ Create User'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Add Store ────────────────────────────────────────────────────────────────
export function AdminAddStore() {
  const [form, setForm] = useState({ name:'', email:'', address:'', ownerId:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  const set = (k, v) => {
    setForm(f => ({...f,[k]:v}));
    if (validators[k]) setErrors(e => ({...e,[k]:validators[k](v)}));
  };

  const validate = () => {
    const errs = {};
    ['name','email','address'].forEach(k => { errs[k] = validators[k]?.(form[k]) || ''; });
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const submit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(''); setSuccess(''); setLoading(true);
    try {
      const payload = { ...form, ownerId: form.ownerId ? parseInt(form.ownerId) : null };
      await adminApi.createStore(payload);
      setSuccess(`Store "${form.name}" created successfully!`);
      setForm({ name:'', email:'', address:'', ownerId:'' });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create store');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout title="Add Store">
      <div style={{ maxWidth: 580 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 className="page-title">Add New Store</h2>
          <p className="page-subtitle">Register a new store on the platform</p>
        </div>
        <div className="card">
          {success && <Alert type="success">{success}</Alert>}
          {apiError && <Alert type="error">{apiError}</Alert>}
          <form onSubmit={submit}>
            <FormGroup label="Store Name" error={errors.name} hint="Min 20, max 60 characters">
              <input className={`form-control ${errors.name?'error':''}`} placeholder="Official store name"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </FormGroup>
            <FormGroup label="Store Email" error={errors.email}>
              <input className={`form-control ${errors.email?'error':''}`} type="email" placeholder="store@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </FormGroup>
            <FormGroup label="Store Address" error={errors.address} hint="Max 400 characters">
              <textarea className={`form-control ${errors.address?'error':''}`} rows={2}
                value={form.address} onChange={e => set('address', e.target.value)} />
            </FormGroup>
            <FormGroup label="Owner User ID (optional)" hint="Provide the ID of an existing STORE_OWNER user">
              <input className="form-control" type="number" placeholder="e.g. 5"
                value={form.ownerId} onChange={e => set('ownerId', e.target.value)} />
            </FormGroup>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? <Spinner /> : '🏬 Create Store'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}