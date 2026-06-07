import { useState, useEffect, useCallback } from 'react';
import { storeApi, authApi } from '../../services/api';
import { AppLayout } from '../layout/Layout';
import { Spinner, Alert, StarDisplay, StarPicker, SortTh, Pagination, EmptyState, Modal, FormGroup } from '../common/UI';

// ─── Change Password ──────────────────────────────────────────────────────────
const specialCharRegex = new RegExp('[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>/?]');
export function ChangePasswordPage({ role }) {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwErr, setPwErr] = useState('');

  const validatePw = v => {
    if (!v) return 'Required';
    if (v.length < 8 || v.length > 16) return '8–16 characters';
    if (!/[A-Z]/.test(v)) return 'Need at least 1 uppercase letter';
    if (!specialCharRegex.test(v)) return 'Need at least 1 special character';
    return '';
  };

  const submit = async e => {
    e.preventDefault();
    const err = validatePw(form.newPassword);
    setPwErr(err);
    if (err) return;
    setError(''); setSuccess(''); setLoading(true);
    try {
      await authApi.changePassword(form);
      setSuccess('Password changed successfully!');
      setForm({ currentPassword:'', newPassword:'' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout title="Change Password">
      <div style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 className="page-title">Change Password</h2>
          <p className="page-subtitle">Update your account password</p>
        </div>
        <div className="card">
          {success && <Alert type="success">{success}</Alert>}
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={submit}>
            <FormGroup label="Current Password">
              <input className="form-control" type="password" placeholder="Enter current password"
                value={form.currentPassword} onChange={e => setForm(f=>({...f,currentPassword:e.target.value}))} required />
            </FormGroup>
            <FormGroup label="New Password" error={pwErr} hint="8–16 chars, 1 uppercase, 1 special character">
              <input className={`form-control ${pwErr?'error':''}`} type="password" placeholder="Enter new password"
                value={form.newPassword}
                onChange={e => { setForm(f=>({...f,newPassword:e.target.value})); setPwErr(validatePw(e.target.value)); }} required />
            </FormGroup>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? <Spinner /> : '🔑 Change Password'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Rating Modal ─────────────────────────────────────────────────────────────
function RatingModal({ store, onClose, onSaved }) {
  const [value, setValue] = useState(store.userRating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isUpdate = !!store.userRating;

  const submit = async () => {
    if (!value) { setError('Please select a rating'); return; }
    setError(''); setLoading(true);
    try {
      if (isUpdate) await storeApi.updateRating(store.id, { value });
      else          await storeApi.submitRating(store.id, { value });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rating');
    } finally { setLoading(false); }
  };

  return (
    <Modal title={`${isUpdate ? 'Update' : 'Rate'} — ${store.name}`} onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading || !value}>
            {loading ? <Spinner /> : isUpdate ? '✏️ Update Rating' : '⭐ Submit Rating'}
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 16, color:'var(--muted)', fontSize:13 }}>
        <strong style={{color:'var(--dark)'}}>Address:</strong> {store.address}
      </div>
      {store.averageRating != null && (
        <div style={{ marginBottom: 20 }}>
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:4}}>Overall Rating</div>
          <StarDisplay value={store.averageRating} />
        </div>
      )}
      <div>
        <div style={{fontSize:13,fontWeight:500,marginBottom:8,color:'var(--mid)'}}>Your Rating</div>
        <StarPicker value={value} onChange={setValue} />
        {error && <Alert type="error" style={{marginTop:10}}>{error}</Alert>}
      </div>
    </Modal>
  );
}

// ─── Browse Stores ────────────────────────────────────────────────────────────
export function UserStores() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name:'', address:'' });
  const [sort, setSort] = useState({ sortBy:'name', sortDir:'asc' });
  const [page, setPage] = useState(0);
  const [ratingStore, setRatingStore] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    storeApi.getStores({ ...filters, ...sort, page, size: 10 })
      .then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [filters, sort, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSort = field => setSort(s =>
    ({ sortBy: field, sortDir: s.sortBy === field && s.sortDir === 'asc' ? 'desc' : 'asc' }));

  return (
    <AppLayout title="Browse Stores">
      <div style={{ marginBottom: 20 }}>
        <h2 className="page-title">All Stores</h2>
        <p className="page-subtitle">Search and rate stores on the platform</p>
      </div>

      {/* Search */}
      <div className="card card-sm" style={{ marginBottom: 20 }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="form-group" style={{ marginBottom:0, flex:1, minWidth:160 }}>
            <label className="form-label">Search by Name</label>
            <input className="form-control" placeholder="Store name..."
              value={filters.name} onChange={e => { setFilters(f=>({...f,name:e.target.value})); setPage(0); }} />
          </div>
          <div className="form-group" style={{ marginBottom:0, flex:1, minWidth:160 }}>
            <label className="form-label">Search by Address</label>
            <input className="form-control" placeholder="Location..."
              value={filters.address} onChange={e => { setFilters(f=>({...f,address:e.target.value})); setPage(0); }} />
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
                    <SortTh label="Store Name" field="name"    {...sort} onSort={handleSort} />
                    <SortTh label="Address"    field="address" {...sort} onSort={handleSort} />
                    <th>Overall Rating</th>
                    <th>Your Rating</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content?.length ? data.content.map(s => (
                    <tr key={s.id}>
                      <td><span style={{fontWeight:500}}>{s.name}</span></td>
                      <td style={{color:'var(--muted)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.address}</td>
                      <td><StarDisplay value={s.averageRating} /></td>
                      <td>
                        {s.userRating
                          ? <div className="rating-display"><span style={{color:'#F59E0B',fontSize:16}}>★</span><span className="rating-number">{s.userRating}/5 (your rating)</span></div>
                          : <span style={{color:'var(--muted)',fontSize:12}}>Not rated</span>
                        }
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setRatingStore(s)}>
                          {s.userRating ? '✏️ Modify' : '⭐ Rate'}
                        </button>
                      </td>
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

      {ratingStore && (
        <RatingModal
          store={ratingStore}
          onClose={() => setRatingStore(null)}
          onSaved={fetch}
        />
      )}
    </AppLayout>
  );
}