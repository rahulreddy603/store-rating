import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api' : '/api');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),

  getUsers:  (params) => api.get('/admin/users', { params }),
  getUser:   (id)     => api.get(`/admin/users/${id}`),
  createUser:(data)   => api.post('/admin/users', data),

  getStores:   (params) => api.get('/admin/stores', { params }),
  createStore: (data)   => api.post('/admin/stores', data),
};

// ── Stores (normal user) ────────────────────────────────────────────────────
export const storeApi = {
  getStores:    (params)           => api.get('/stores', { params }),
  submitRating: (storeId, data)    => api.post(`/stores/${storeId}/ratings`, data),
  updateRating: (storeId, data)    => api.put(`/stores/${storeId}/ratings`, data),
};

// ── Store Owner ─────────────────────────────────────────────────────────────
export const ownerApi = {
  getDashboard: () => api.get('/store-owner/dashboard'),
};

export default api;