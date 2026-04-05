import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120s — Render free tier cold starts can take 60+ seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
};

export const otpAPI = {
  request: (data) => api.post('/otp/request', data),
  verify: (data, otp) => api.post(`/otp/verify?otp=${otp}`, data),
};

export const verificationAPI = {
  verifyEmail: (email, otp) => api.post(`/verification/verify-email?email=${email}&otp=${otp}`),
  verifyPhone: (phoneNumber, otp) => api.post(`/verification/verify-phone?phoneNumber=${phoneNumber}&otp=${otp}`),
};

export const scanAPI = {
  getAllowance: () => api.get('/scan/allowance'),
  scan: (imageBase64) => api.post('/scan', { imageBase64 }),
  scanWithVision: (imageBase64) => api.post('/api/scan/vision/base64', { imageBase64 }),
  scanVisionFile: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/api/scan/vision', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
  confirmScan: (pgn, fen) => api.post('/api/scan/confirm', { pgn, fen }),
  getScanHistory: () => api.get('/api/scan/history'),
  watchAd: () => api.post('/scan/watch-ad'),
};

export const gamesAPI = {
  getMyGames: () => api.get('/api/games'),
  getPaginated: (page = 0, size = 20) => api.get(`/api/games/my/paginated?page=${page}&size=${size}`),
  getById: (gameId) => api.get(`/api/games/${gameId}`),
  search: (criteria) => api.post('/api/games/search', criteria),
  getPublic: (page = 0, size = 20) => api.get(`/api/games/public?page=${page}&size=${size}`),
  getTournament: () => api.get('/api/games/tournament'),
  updateVisibility: (gameId, isPublic) => api.patch(`/api/games/${gameId}/visibility?isPublic=${isPublic}`),
  delete: (gameId) => api.delete(`/api/games/${gameId}`),
  getCount: () => api.get('/api/games/count'),
  import: (pgn) => api.post('/api/games/import', { pgn }),
};

export const statsAPI = {
  getMe: () => api.get('/api/stats/me'),
  refresh: () => api.post('/api/stats/refresh'),
};

export const analysisAPI = {
  analyzeGame: (gameId) => api.post(`/api/analysis/game/${gameId}`),
  getAnalysis: (gameId) => api.get(`/api/analysis/game/${gameId}`),
  analyzePgn: (pgn) => api.post('/api/analysis/pgn', pgn, { headers: { 'Content-Type': 'text/plain' } }),
  getRecent: () => api.get('/api/analysis/recent'),
};

export default api;
