import api from './axios';

export const inventoryApi = {
  getStock: (params) => api.get('/inventory/stock', { params }),
  getMovements: (params) => api.get('/inventory/movements', { params }),
  adjustStock: (data) => api.post('/inventory/adjust', data),
  getLowStock: () => api.get('/inventory/low-stock'),
  getStockValue: () => api.get('/inventory/stock-value'),
};
