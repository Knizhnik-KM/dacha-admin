import axios from 'axios';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://89.110.92.227:3002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик запросов для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Сервис для работы с API
const apiService = {
  // Аутентификация
  auth: {
    login: (credentials) => api.post('/admin/login', credentials),
  },
  
  // Пользователи
  users: {
    getAll: (page = 1, limit = 10, search = '') => 
      api.get(`/admin/users?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),
    getById: (userId) => api.get(`/admin/users/${userId}`),
    toggleBlock: (userId) => api.patch(`/admin/users/${userId}/toggle-block`),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  },

  // --- Нейросеть (OpenAI) ---
  openai: {
    getInfo: () => api.get('/openai/info'),
    getBalance: () => api.get('/openai/balance'),
    testRequest: (data) => api.post('/openai/test', data),
  },

  // --- Растения пользователей (админка) ---
  adminPlants: {
    getAll: (page = 1, limit = 20, search = '', species = '') =>
      api.get(`/admin/plants?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}${species ? `&species=${species}` : ''}`),
    delete: (id) => api.delete(`/admin/plants/${id}`),
    update: (id, data) => api.put(`/admin/plants/${id}`, data),
    getStats: () => api.get('/admin/plants/stats/summary'),
  },

  // --- Напоминания (админка) ---
  adminReminders: {
    getReminders: (page = 1, limit = 20, search = '', type = '', isActive = '', userId = '', plantId = '') => 
      api.get(`/admin/reminders?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}${type ? `&type=${type}` : ''}${isActive !== '' ? `&isActive=${isActive}` : ''}${userId ? `&userId=${userId}` : ''}${plantId ? `&plantId=${plantId}` : ''}`),
    updateReminder: (reminderId, data) => api.put(`/admin/reminders/${reminderId}`, data),
    deleteReminder: (reminderId) => api.delete(`/admin/reminders/${reminderId}`),
    deleteManyReminders: (ids) => api.delete('/admin/reminders/bulk', { data: { ids } }),
    getStats: () => api.get('/admin/reminders/stats'),
  },

  // --- Напоминания (пользователи) ---
  reminders: {
    getAll: (page = 1, limit = 100, startDate = '', endDate = '', date = '', week = '', type = '', timeOfDay = '', isActive = '', plantId = '') =>
      api.get(`/reminders?page=${page}&limit=${limit}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}${date ? `&date=${date}` : ''}${week ? `&week=${week}` : ''}${type ? `&type=${type}` : ''}${timeOfDay ? `&timeOfDay=${timeOfDay}` : ''}${isActive !== '' ? `&isActive=${isActive}` : ''}${plantId ? `&plantId=${plantId}` : ''}`),
    getByDate: (date) => api.get(`/reminders?date=${date}`),
    getByWeek: (week) => api.get(`/reminders?week=${week}`),
    getCalendar: (month) => api.get(`/reminders/calendar?month=${month}`),
    getToday: () => api.get('/reminders/today'),
    getUpcoming: (days = 7) => api.get(`/reminders/upcoming?days=${days}`),
    create: (data) => api.post('/reminders', data),
    update: (id, data) => api.put(`/reminders/${id}`, data),
    delete: (id) => api.delete(`/reminders/${id}`),
    toggleActive: (id) => api.patch(`/reminders/${id}/toggle`),
  },

  // --- Достижения (админка) ---
  adminAchievements: {
    getAchievements: (page = 1, limit = 20, search = '', type = '', userId = '') => 
      api.get(`/admin/achievements?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}${type ? `&type=${type}` : ''}${userId ? `&userId=${userId}` : ''}`),
    createAchievement: (data) => api.post('/admin/achievements', data),
    updateAchievement: (achievementId, data) => api.put(`/admin/achievements/${achievementId}`, data),
    deleteAchievement: (achievementId) => api.delete(`/admin/achievements/${achievementId}`),
    getStats: () => api.get('/admin/achievements/stats'),
    awardToUser: (data) => api.post('/admin/achievements/award', data),
  },

  // --- Достижения (пользователи) ---
  achievements: {
    getAll: () => api.get('/achievements'),
    getTemplates: () => api.get('/achievements/templates'),
    getStats: () => api.get('/achievements/stats'),
    create: (data) => api.post('/achievements', data),
    delete: (id) => api.delete(`/achievements/${id}`),
  },

  // --- История Чатов (админка) ---
  adminChatHistory: {
    getChatSessions: (page = 1, limit = 10, searchTerm = '', status = '') => 
      api.get(`/admin/chat/sessions?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}${status ? `&status=${status}` : ''}`),
    getChatMessages: (sessionId, page = 1, limit = 50) => 
      api.get(`/admin/chat/sessions/${sessionId}/messages?page=${page}&limit=${limit}`),
    getChatStats: () => api.get('/admin/chat/stats'),
    takeChat: (data) => api.post('/admin/chat/take', data),
    releaseChat: (data) => api.post('/admin/chat/release', data),
    sendOperatorMessage: (data) => api.post('/admin/chat/send', data),
  },

  // --- Избранное (админка) ---
  adminFavorites: {
    getFavorites: (page = 1, limit = 10, searchTerm = '', userId = '', itemType = '') => 
      api.get(`/admin/favorites?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}${userId ? `&userId=${userId}` : ''}${itemType ? `&itemType=${itemType}` : ''}`),
    deleteFavorite: (favoriteId) => api.delete(`/admin/favorites/${favoriteId}`),
  },

  // --- Справочник Растений (админка) ---
  adminPlantCatalog: {
    getCatalogPlants: (page = 1, limit = 10, search = '') => 
      api.get(`/admin/plant-catalog?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),
    createCatalogPlant: (data) => api.post('/admin/plant-catalog', data),
    updateCatalogPlant: (plantId, data) => api.put(`/admin/plant-catalog/${plantId}`, data),
    deleteCatalogPlant: (plantId) => api.delete(`/admin/plant-catalog/${plantId}`),
  },

  // --- Управление кодами подлинности товаров (админка) ---
  adminProductCodes: {
    getProductCodes: (page = 1, limit = 10, search = '', status = '') => 
      api.get(`/admin/product-codes?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`),
    createProductCode: (data) => api.post('/admin/product-codes', data),
    updateProductCode: (codeId, data) => api.put(`/admin/product-codes/${codeId}`, data),
    deleteProductCode: (codeId) => api.delete(`/admin/product-codes/${codeId}`),
    getProductCodeStats: () => api.get('/admin/product-codes/stats'),
  },

  // --- Логи уведомлений (админка) ---
  adminNotificationLogs: {
    getNotificationLogs: (page = 1, limit = 10, searchTerm = '', userId = '', type = '', status = '') => 
      api.get(`/admin/notification-logs?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}${userId ? `&userId=${userId}` : ''}${type ? `&type=${type}` : ''}${status ? `&status=${status}` : ''}`),
  },

  // --- История сканирований (админка) ---
  adminScanHistory: {
    getScanHistory: (page = 1, limit = 10) =>
      api.get(`/admin/scan-history?page=${page}&limit=${limit}`),
    deleteAll: () => api.delete('/admin/scan-history/all'),
    deleteBatch: (ids) => api.delete('/admin/scan-history/batch', { data: { ids } }),
    deleteOldFormat: () => api.delete('/admin/scan-history/old-format'),
  },

  // --- Полезная информация ---
  admin: {
    usefulInfo: {
      get: () => api.get('/admin/useful-info'),
      update: (data) => api.put('/admin/useful-info', data),
      addMainItem: (data) => api.post('/admin/useful-info/main-items', data),
      deleteMainItem: (itemId) => api.delete(`/admin/useful-info/main-items/${itemId}`),
    },
  },
};

export default apiService; 