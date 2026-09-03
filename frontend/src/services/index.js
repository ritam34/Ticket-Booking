import api from './api';

export const authService = {
  signup: (data) => api.post('/auth/signup', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const trainService = {
  search: (params) => api.get('/trains/search', { params }).then((r) => r.data),
  getSchedule: (id) => api.get(`/trains/schedules/${id}`).then((r) => r.data),
  listAll: () => api.get('/trains').then((r) => r.data),
  create: (data) => api.post('/trains', data).then((r) => r.data),
  update: (id, data) => api.put(`/trains/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/trains/${id}`).then((r) => r.data),
  createSchedule: (data) => api.post('/trains/schedules', data).then((r) => r.data),
};

export const bookingService = {
  lockSeats: (data) => api.post('/bookings/lock-seats', data).then((r) => r.data),
  release: (id) => api.post(`/bookings/${id}/release`).then((r) => r.data),
  myBookings: () => api.get('/bookings/my').then((r) => r.data),
  byPNR: (pnr) => api.get(`/bookings/pnr/${pnr}`).then((r) => r.data),
  cancel: (id) => api.post(`/bookings/${id}/cancel`).then((r) => r.data),
};

export const paymentService = {
  createOrder: (bookingId) => api.post('/payments/create-order', { bookingId }).then((r) => r.data),
  verify: (data) => api.post('/payments/verify', data).then((r) => r.data),
};

export const ticketService = {
  downloadUrl: (bookingId) => `${api.defaults.baseURL}/tickets/${bookingId}/pdf`,
};

export const adminService = {
  allBookings: () => api.get('/admin/bookings').then((r) => r.data),
  revenue: () => api.get('/admin/revenue').then((r) => r.data),
};
