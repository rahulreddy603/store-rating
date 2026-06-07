import { Navigate } from 'react-router-dom';
import { useAuth } from './../../context/AuthContext';

/**
 * Wraps a route so only users with an allowed role can access it.
 * Unauthenticated users are sent to /login.
 * Wrong-role users are sent to their home dashboard.
 */
const ROLE_HOME = {
  ADMIN:       '/admin/dashboard',
  USER:        '/user/stores',
  STORE_OWNER: '/owner/dashboard',
};

export function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }

  return children;
}