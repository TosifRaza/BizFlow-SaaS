// // import api from './axios';

// // export const employeeApi = {
// //   create: (data) => api.post('/employees', data),
// //   getAll: (params) => api.get('/employees', { params }),
// //   getById: (id) => api.get(`/employees/${id}`),
// //   update: (id, data) => api.put(`/employees/${id}`, data),
// //   deactivate: (id) => api.put(`/employees/${id}/deactivate`),
// // };
// import api from './axios';

// export const employeeApi = {
//   create: (data) => api.post('/employees', data),
//   getAll: (params) => api.get('/employees', { params }),
//   getById: (id) => api.get(`/employees/${id}`),
//   update: (id, data) => api.put(`/employees/${id}`, data),
//   deactivate: (id) => api.put(`/employees/${id}/deactivate`),
//   resetPassword: (id, password) => api.put(`/employees/${id}/reset-password`, { password }),
// };
import api from './axios';

export const employeeApi = {
  create: (data) => api.post('/employees', data),
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  update: (id, data) => api.put(`/employees/${id}`, data),
  deactivate: (id) => api.put(`/employees/${id}/deactivate`),
  resetPassword: (id, password) => api.put(`/employees/${id}/reset-password`, { password }),
};