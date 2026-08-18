import api from './axios';

export const reportApi = {
  sales: (params) => api.get('/reports/sales', { params }),
  inventory: (params) => api.get('/reports/inventory', { params }),
  customer: (params) => api.get('/reports/customers', { params }),
  supplier: (params) => api.get('/reports/suppliers', { params }),
  expense: (params) => api.get('/reports/expenses', { params }),
  profitLoss: (params) => api.get('/reports/profit-loss', { params }),
};
