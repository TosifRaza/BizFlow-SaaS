import api from './axios';

export const businessApi = {
  getBusiness: () => api.get('/business'),
  updateBusiness: (data) => api.put('/business', data),
  updateSettings: (data) => api.put('/business/settings', data),
  getStats: () => api.get('/business/stats'),
};
