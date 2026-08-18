import api from './axios';

export const purchaseApi = {
  create: (data) => api.post('/purchases', data),
  getAll: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  recordPayment: (id, data) => api.post(`/purchases/${id}/payments`, data),
};
