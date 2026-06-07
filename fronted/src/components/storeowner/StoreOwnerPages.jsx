import { useState, useEffect } from 'react';
import { ownerApi } from '../../services/api';
import { AppLayout } from '../layout/Layout';
import { Spinner, Alert, StarDisplay, SortTh, EmptyState } from '../common/UI';

// ─── Star display row ────────────────────────────────────────────────────────
function RatingRow({ rating, index }) {
  return (
    <tr>
      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{index + 1}</td>
      <td>
        <div style={{ fontWeight: 500, color: 'var(--dark)' }}>{rating.userName}</div>
      </td>
      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{rating.userEmail}</td>
      <td>
        <div className="rating-display">
          <span style={{ color: '#F59E0B', fontSize: 18 }}>{'★'.repeat(rating.value)}{'☆'.repeat(5 - rating.value)}</span>
          <span className="rating-number">{rating.value}/5</span>
        </div>
      </td>
      <td style={{ color: 'var(--muted)', fontSize: 12 }}>
        {rating.updatedAt
          ? new Date(rating.updatedAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
          : '—'}
      </td>
    </tr>
  );
}

// ─── Store Owner Dashboard ────────────────────────────────────────────────────
export function StoreOwnerDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [sortBy, setSortBy]   = useState('userName');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    ownerApi.getDashboard()
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load dashboard. Make sure your account is linked to a store.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field) => {
    setSortDir(prev => sortBy === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortBy(field);
  };

  // Client-side filter + sort on ratings list
  const filteredRatings = (data?.ratingsList || [])
    .filter(r =>
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // Distribution
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: (data?.ratingsList || []).filter(r => r.value === star).length,
  }));
  const total = data?.ratingsList?.length || 0;

  if (loading) {
    return (
      <AppLayout title="My Store Dashboard">
        <div className="loading-page"><Spinner dark /><span>Loading dashboard…</span></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Store Dashboard">
      {error && <Alert type="error">{error}</Alert>}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 className="page-title">{data?.storeName || 'My Store'}</h2>
        <p className="page-subtitle">Your store ratings dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {/* Average rating */}
        <div className="stat-card" style={{ gridColumn: 'span 1' }}>
          <div className="stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>⭐</div>
          <div className="stat-val">{data?.averageRating ? data.averageRating.toFixed(2) : '—'}</div>
          <div className="stat-label">Average Rating</div>
          <div style={{ marginTop: 8 }}>
            <StarDisplay value={data?.averageRating} />
          </div>
        </div>

        {/* Total ratings */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>📝</div>
          <div className="stat-val">{data?.totalRatings ?? 0}</div>
          <div className="stat-label">Total Ratings Received</div>
        </div>

        {/* Distribution */}
        <div className="stat-card">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Rating Distribution
          </div>
          {distribution.map(({ star, count }) => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: '#F59E0B', width: 14 }}>{star}★</span>
              <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: '#F59E0B',
                  width: total ? `${(count / total) * 100}%` : '0%',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', width: 20 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--dark)' }}>Customers Who Rated Your Store</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              {filteredRatings.length} of {total} rating{total !== 1 ? 's' : ''}
            </p>
          </div>
          {/* Search within ratings */}
          <div style={{ minWidth: 220 }}>
            <input
              className="form-control"
              placeholder="🔍  Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>

        {filteredRatings.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No ratings yet"
            message={search ? 'No ratings match your search.' : 'Once customers rate your store they will appear here.'}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <SortTh label="Customer Name"  field="userName"  sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <SortTh label="Email"          field="userEmail" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <SortTh label="Rating"         field="value"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <SortTh label="Date"           field="updatedAt" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {filteredRatings.map((r, i) => (
                  <RatingRow key={r.id} rating={r} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}