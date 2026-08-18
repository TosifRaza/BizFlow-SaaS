import api from './axios';

export const branchApi = {
  getAll: (params) => api.get('/branches', { params }),
  getById: (id) => api.get(`/branches/${id}`),
};
