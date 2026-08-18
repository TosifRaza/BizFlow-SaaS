import api from './axios';

export const uploadApi = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (publicId) => api.delete(`/upload/image/${publicId}`),
};
