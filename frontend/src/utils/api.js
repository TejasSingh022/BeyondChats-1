import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new Error(error.response.data.error || 'An error occurred');
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const articleAPI = {
  getArticles: async (params = {}) => {
    const response = await api.get('/api/articles', { params });
    return response.data;
  },
  
  getArticle: async (id) => {
    const response = await api.get(`/api/articles/${id}`);
    return response.data;
  },
  
  createArticle: async (data) => {
    const response = await api.post('/api/articles', data);
    return response.data;
  },
  
  updateArticle: async (id, data) => {
    const response = await api.put(`/api/articles/${id}`, data);
    return response.data;
  },
  
  deleteArticle: async (id) => {
    const response = await api.delete(`/api/articles/${id}`);
    return response.data;
  },
  
  scrapeArticles: async () => {
    const response = await api.post('/api/articles/scrape');
    return response.data;
  },
  
  getRewrittenArticle: async (id) => {
    const response = await api.get(`/api/articles/${id}/rewritten`);
    return response.data;
  },
};

export default api;

