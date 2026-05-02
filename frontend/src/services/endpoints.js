import API from './api';

export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

export const reviewService = {
  create: (data) => API.post('/reviews', data),
  getAll: (params) => API.get('/reviews', { params }),
  getById: (id) => API.get(`/reviews/${id}`),
};

export const metricsService = {
  analyze: (reviewId) => API.post('/metrics/analyze', { reviewId }),
  getResult: (reviewId) => API.get(`/metrics/${reviewId}`),
};

export const aiService = {
  analyze: (reviewId) => API.post('/ai/analyze', { reviewId }),
  getResult: (reviewId) => API.get(`/ai/${reviewId}`),
};

export const reportService = {
  getFairness: (params) => API.get('/reports/fairness', { params }),
  getAdmin: () => API.get('/reports/admin'),
};
