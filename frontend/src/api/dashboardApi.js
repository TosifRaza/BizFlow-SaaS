import api from './axios';

export const dashboardApi = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
  getChartData: (params) => api.get('/dashboard/chart-data', { params }),
};
