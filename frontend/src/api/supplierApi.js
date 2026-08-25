import api from './axios';

export const supplierApi = {
  create: (data) => api.post('/suppliers', data),
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getLedger: (id, params) => api.get(`/suppliers/${id}/ledger`, { params }),
  recordPayment: (id, data) => api.post(`/suppliers/${id}/payment`, data),
  getStats: () => api.get('/suppliers/stats'),
};
