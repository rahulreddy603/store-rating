import { useState } from 'react';

// ─── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ dark }) {
  return <div className={`spinner ${dark ? 'spinner-dark' : ''}`} />;
}

// ─── Alert ──────────────────────────────────────────────────────────────────
export function Alert({ type = 'error', children }) {
  const icons = { error:'⚠️', success:'✅', info:'ℹ️', warning:'⚡' };
  return (
    <div className={`alert alert-${type}`}>
      <span>{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Stars ──────────────────────────────────────────────────────────────────
export function StarDisplay({ value, max = 5 }) {
  const v = value ? Math.round(value * 10) / 10 : null;
  return (
    <div className="rating-display">
      <div className="stars">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`star ${i <= Math.round(v || 0) ? 'star-filled' : 'star-empty'}`}>★</span>
        ))}
      </div>
      <span className="rating-number">{v ? v.toFixed(1) : '—'}</span>
    </div>
  );
}

export function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i}
          className={`star ${i <= (hovered || value) ? 'star-filled' : 'star-empty'}`}
          style={{ fontSize: 28, cursor: 'pointer' }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >★</span>
      ))}
    </div>
  );
}

// ─── Role Badge ─────────────────────────────────────────────────────────────
export function RoleBadge({ role }) {
  const map = { ADMIN: 'badge-admin', USER: 'badge-user', STORE_OWNER: 'badge-owner' };
  const labels = { ADMIN: 'Admin', USER: 'User', STORE_OWNER: 'Store Owner' };
  return <span className={`badge ${map[role] || ''}`}>{labels[role] || role}</span>;
}

// ─── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Sortable Table Header ───────────────────────────────────────────────────
export function SortTh({ label, field, sortBy, sortDir, onSort }) {
  const active = sortBy === field;
  return (
    <th className="sortable" onClick={() => onSort(field)}>
      {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </th>
  );
}

// ─── Pagination ─────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>‹</button>
      {[...Array(totalPages)].map((_, i) => (
        <button key={i} className={i === page ? 'active' : ''} onClick={() => onChange(i)}>{i + 1}</button>
      ))}
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title = 'No data found', message }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p style={{ fontSize: 13 }}>{message}</p>}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────
export function FormGroup({ label, error, hint, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <p className="form-error">{error}</p>}
      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm" onClose={onCancel}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}