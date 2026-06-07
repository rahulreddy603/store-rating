import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard',  label: 'Dashboard', icon: '📊' },
  { to: '/admin/users',      label: 'Users',     icon: '👥' },
  { to: '/admin/stores',     label: 'Stores',    icon: '🏪' },
  { to: '/admin/add-user',   label: 'Add User',  icon: '➕' },
  { to: '/admin/add-store',  label: 'Add Store', icon: '🏬' },
];

const userLinks = [
  { to: '/user/stores', label: 'Browse Stores', icon: '🏪' },
  { to: '/user/password', label: 'Change Password', icon: '🔑' },
];

const ownerLinks = [
  { to: '/owner/dashboard', label: 'My Dashboard', icon: '📊' },
  { to: '/owner/password',  label: 'Change Password', icon: '🔑' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'ADMIN' ? adminLinks
              : user?.role === 'USER'  ? userLinks
              : ownerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = { ADMIN: 'Administrator', USER: 'Customer', STORE_OWNER: 'Store Owner' };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⭐ StoreRater</h1>
        <p>Rate. Discover. Share.</p>
      </div>

      <nav className="sidebar-nav">
        <div className="section-label">{roleLabel[user?.role] || 'Menu'}</div>
        {links.map(l => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) => isActive ? 'active' : ''}>
            <span>{l.icon}</span> {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div style={{ padding: '8px 12px', marginBottom: 8, color: '#94A3B8', fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
        </div>
        <button className="sidebar-nav" style={{ padding: 0 }}
          onClick={handleLogout}>
          <button style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', color:'#EF4444', fontWeight:500, width:'100%', background:'none', border:'none', cursor:'pointer', fontSize:13.5 }}>
            <span>🚪</span> Logout
          </button>
        </button>
      </div>
    </aside>
  );
}

export function TopBar({ title }) {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
  return (
    <div className="top-bar">
      <div>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--dark)' }}>{title}</span>
      </div>
      <div className="topbar-user">
        <div className="topbar-avatar">{initials}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.role}</div>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ title, children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar title={title} />
        <div className="page-body fade-in">{children}</div>
      </div>
    </div>
  );
}