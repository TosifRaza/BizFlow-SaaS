import api from './axios';

export const productApi = {
  create: (data) => api.post('/products', data),
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getStats: () => api.get('/products/stats'),
  bulkImport: (formData) => api.post('/products/bulk-import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  bulkExport: (params) => api.get('/products/bulk-export', { params, responseType: 'blob' }),
};
