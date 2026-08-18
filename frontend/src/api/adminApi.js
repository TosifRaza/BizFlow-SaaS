import api from './axios';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getBusinesses: (params) => api.get('/admin/businesses', { params }),
  getBusinessById: (id) => api.get(`/admin/businesses/${id}`),
  activateBusiness: (id) => api.put(`/admin/businesses/${id}/activate`),
  suspendBusiness: (id) => api.put(`/admin/businesses/${id}/suspend`),
  getPlans: () => api.get('/admin/plans'),
  createPlan: (data) => api.post('/admin/plans', data),
  updatePlan: (id, data) => api.put(`/admin/plans/${id}`, data),
  getSubscriptions: (params) => api.get('/admin/subscriptions', { params }),
  getPayments: (params) => api.get('/admin/payments', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getRevenue: (params) => api.get('/admin/revenue', { params }),
  // Feature Flags
  getFeatureFlags: () => api.get('/admin/feature-flags'),
  createFeatureFlag: (data) => api.post('/admin/feature-flags', data),
  updateFeatureFlag: (id, data) => api.put(`/admin/feature-flags/${id}`, data),
  toggleFeatureFlag: (id) => api.put(`/admin/feature-flags/${id}/toggle`),
  deleteFeatureFlag: (id) => api.delete(`/admin/feature-flags/${id}`),
  // Support Requests
  getSupportRequests: (params) => api.get('/admin/support-requests', { params }),
  getSupportRequestById: (id) => api.get(`/admin/support-requests/${id}`),
  updateSupportRequest: (id, data) => api.put(`/admin/support-requests/${id}`, data),
  // Platform Settings
  getPlatformSettings: () => api.get('/admin/settings/platform'),
  updatePlatformSettings: (data) => api.put('/admin/settings/platform', data),
};
