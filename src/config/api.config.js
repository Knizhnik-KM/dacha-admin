// Конфигурация API
const API_CONFIG = {
  // Базовый URL API
  BASE_URL: process.env.REACT_APP_API_URL || 'http://89.110.92.227:3002/api',
  
  // URL для изображений (можем переопределить через переменные окружения)
  IMAGES_BASE_URL: process.env.REACT_APP_IMAGES_URL || process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://89.110.92.227:3002',
  
  // Таймауты
  TIMEOUT: 30000,
  
  // Настройки для изображений
  IMAGES: {
    DEFAULT_PATH: '/uploads/plants/',
    FALLBACK_ICON: '🌱',
    MAX_DISPLAY_SIZE: { width: 80, height: 80 },
    MODAL_SIZE: { width: 400, height: 400 }
  }
};

// Функция для получения полного URL изображения
export const getImageUrl = (imagePath, storageMode = 'local') => {
  if (!imagePath) return '';
  
  // Для Cloudinary URL возвращаем как есть
  if (storageMode === 'cloudinary' || imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Для локального хранения
  let fileName = imagePath;
  
  // Извлекаем имя файла из пути
  if (imagePath.includes('/')) {
    fileName = imagePath.split('/').pop();
  }
  
  // Формируем полный URL
  return `${API_CONFIG.IMAGES_BASE_URL}${API_CONFIG.IMAGES.DEFAULT_PATH}${fileName}`;
};

// Функция для проверки доступности изображения
export const checkImageAvailability = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Ошибка проверки изображения:', error);
    return false;
  }
};

export default API_CONFIG; 