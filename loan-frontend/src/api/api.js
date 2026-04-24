import axios from 'axios';

// ─── Axios instance ──────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL + '/api'
    : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Loans ───────────────────────────────────────────────────────
export const loanAPI = {
  checkEligibility: (params) => api.get('/loans/eligibility', { params }),
  apply: (data) => api.post('/loans/apply', data),
  getMyLoans: (params) => api.get('/loans/my', { params }),
  getLoanById: (id) => api.get(`/loans/${id}`),
};

// ─── EMI ─────────────────────────────────────────────────────────
export const emiAPI = {
  getSchedule: (loanId) => api.get(`/emi/schedule/${loanId}`),
  getPending: (loanId) => api.get(`/emi/pending/${loanId}`),
};

// ─── Payments ────────────────────────────────────────────────────
export const paymentAPI = {
  makePayment: (data) => api.post('/payments/pay', data),
  getMyPayments: (params) => api.get('/payments/my', { params }),
};

// ─── Dashboard ───────────────────────────────────────────────────
export const dashboardAPI = {
  getMyDashboard: () => api.get('/dashboard'),
};

// ─── Admin ───────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllLoans: (params) => api.get('/admin/loans', { params }),
  reviewLoan: (data) => api.post('/admin/loans/review', data),
  getAllUsers: () => api.get('/admin/users'),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`),
};

export default api;
