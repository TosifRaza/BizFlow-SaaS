import api from './axios';

export const subscriptionApi = {
  getCurrentPlan: () => api.get('/subscription/current'),
  getPlans: () => api.get('/subscription/plans'),
  subscribe: (data) => api.post('/subscription/subscribe', data),
  getUsage: () => api.get('/subscription/usage'),
  createPaymentIntent: (data) => api.post('/subscription/create-payment-intent', data),
  verifyPayment: (data) => api.post('/subscription/verify-payment', data),
};
