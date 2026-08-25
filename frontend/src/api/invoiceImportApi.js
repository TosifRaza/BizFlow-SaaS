import api from './axios';

export const invoiceImportApi = {
  uploadAndExtract: (formData, onProgress) =>
    api.post('/invoice-import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
      ...(onProgress ? { onUploadProgress: (e) => onProgress(Math.round((e.loaded * 100) / e.total)) } : {}),
    }),

  createManual: (data) => api.post('/invoice-import/manual', data),

  getProviderInfo: () => api.get('/invoice-import/provider-info'),

  getById: (id) => api.get(`/invoice-import/${id}`),

  confirmImport: (id, data) => api.post(`/invoice-import/${id}/confirm`, data),

  remove: (id) => api.delete(`/invoice-import/${id}`),
};
