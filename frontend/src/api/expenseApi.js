import api from './axios';

export const expenseApi = {
  create: (data) => api.post('/expenses', data),
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: () => api.get('/expenses/stats'),
  uploadReceipt: (id, formData) => api.post(`/expenses/${id}/receipt`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteReceipt: (id) => api.delete(`/expenses/${id}/receipt`),
};
