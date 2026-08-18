import api from './axios';

export const saleApi = {
  create: (data) => api.post('/sales', data),
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  recordPayment: (id, data) => api.post(`/sales/${id}/payments`, data),
  voidSale: (id, data) => api.put(`/sales/${id}/void`, data),
  returnSale: (id, data) => api.post(`/sales/${id}/return`, data),
  downloadPdf: (id) => api.get(`/sales/${id}/pdf`, { responseType: 'blob' }),
};
