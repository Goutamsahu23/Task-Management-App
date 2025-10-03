// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiInstance = axios.create({
  baseURL: API_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT automatically (from localStorage)
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || '';
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

export default {
  // Auth
  register: (data) => apiInstance.post('/auth/register', data),
  login: (data) => apiInstance.post('/auth/login', data),
  me: () => apiInstance.get('/auth/me'),

  // Boards
  getBoards: () => apiInstance.get('/boards'),
  createBoard: (data) => apiInstance.post('/boards', data),
  getBoard: (id) => apiInstance.get(`/boards/${id}`),
  renameBoard: (id, data) => apiInstance.put(`/boards/${id}`, data),
  deleteBoard: (id) => apiInstance.delete(`/boards/${id}`),
  inviteMember: (id, data) => apiInstance.post(`/boards/${id}/invite`, data),
  changeMemberRole: (id, data) => apiInstance.post(`/boards/${id}/change-role`, data),

  // Lists
  createList: (data) => apiInstance.post('/lists', data),
  renameList: (id, data) => apiInstance.put(`/lists/${id}`, data),
  deleteList: (id) => apiInstance.delete(`/lists/${id}`),
  reorderLists: (data) => apiInstance.post('/lists/reorder', data),

  // Cards
  createCard: (data) => apiInstance.post('/cards', data),
  updateCard: (id, data) => apiInstance.put(`/cards/${id}`, data),
  moveCard: (data) => apiInstance.post('/cards/move', data),
  deleteCard: (id) => apiInstance.delete(`/cards/${id}`),

  // Card comments
  addComment: (cardId, data) => apiInstance.post(`/cards/${cardId}/comments`, data),

  // Attachments
  uploadAttachment: (cardId, formData, onUploadProgress) =>
    apiInstance.post(`/cards/${cardId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    }),
  deleteAttachment: (cardId, attachmentId) => apiInstance.delete(`/cards/${cardId}/attachments/${attachmentId}`),

  // Search
  searchCards: (params) => apiInstance.get('/search/cards', { params }),
};
