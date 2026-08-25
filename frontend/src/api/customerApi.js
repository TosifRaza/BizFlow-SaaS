import api from './axios';

export const customerApi = {
  create: (data) => api.post('/customers', data),
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getLedger: (id, params) => api.get(`/customers/${id}/ledger`, { params }),
  recordPayment: (id, data) => api.post(`/customers/${id}/payment`, data),
  getStats: () => api.get('/customers/stats'),
};
