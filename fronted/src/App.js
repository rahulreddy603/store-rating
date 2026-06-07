import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import { LoginPage, RegisterPage } from './components/auth/AuthPages';

// Admin
import {
  AdminDashboard,
  AdminUsers,
  AdminStores,
  AdminAddUser,
  AdminAddStore,
} from './components/admin/AdminPages';

// Normal User
import { UserStores, ChangePasswordPage } from './components/user/UserPages';

// Store Owner
import { StoreOwnerDashboard } from './components/storeowner/StoreOwnerPages';

// Route guard
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Redirect to the right home based on role
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const homes = { ADMIN: '/admin/dashboard', USER: '/user/stores', STORE_OWNER: '/owner/dashboard' };
  return <Navigate to={homes[user.role] || '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<RootRedirect />} />

      {/* ── ADMIN ─────────────────────────────────────────── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>
      } />
      <Route path="/admin/stores" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminStores /></ProtectedRoute>
      } />
      <Route path="/admin/add-user" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminAddUser /></ProtectedRoute>
      } />
      <Route path="/admin/add-store" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminAddStore /></ProtectedRoute>
      } />

      {/* ── NORMAL USER ───────────────────────────────────── */}
      <Route path="/user/stores" element={
        <ProtectedRoute allowedRoles={['USER']}><UserStores /></ProtectedRoute>
      } />
      <Route path="/user/password" element={
        <ProtectedRoute allowedRoles={['USER']}><ChangePasswordPage /></ProtectedRoute>
      } />

      {/* ── STORE OWNER ───────────────────────────────────── */}
      <Route path="/owner/dashboard" element={
        <ProtectedRoute allowedRoles={['STORE_OWNER']}><StoreOwnerDashboard /></ProtectedRoute>
      } />
      <Route path="/owner/password" element={
        <ProtectedRoute allowedRoles={['STORE_OWNER']}><ChangePasswordPage /></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}