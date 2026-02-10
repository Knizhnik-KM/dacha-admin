import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Alert,
  Link,
  Container,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  Tooltip,
  Modal,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  Badge,
  Grid
} from '@mui/material';
import { 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  CleaningServices as CleaningServicesIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Thermostat as ThermostatIcon,
  WbSunny as LightIcon,
  Opacity as HumidityIcon,
  Grass as SoilIcon,
  LocalPharmacy as ToxicityIcon,
  Speed as DifficultyIcon
} from '@mui/icons-material';
// Предполагается, что apiService настроен для вызовов к вашему backend
import apiService from '../services/api';
import { getImageUrl } from '../config/api.config';

// Стили для модального окна
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AdminScanHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [storageMode, setStorageMode] = useState('local'); // Режим хранения файлов
  
  // Состояния для диалогов удаления
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', loading: false });

  const fetchScanHistory = async () => {
    setLoading(true);
    console.log('[AdminScanHistory] fetchScanHistory: start', { page, rowsPerPage });
    try {
      const response = await apiService.adminScanHistory.getScanHistory(page + 1, rowsPerPage);
      console.log('[AdminScanHistory] fetchScanHistory: response', response);
      if (response.data.success) {
        console.log('[AdminScanHistory] fetchScanHistory: data', response.data.data);
        
        // Выводим данные о фото для диагностики
        if (response.data.data.history && response.data.data.history.length > 0) {
          console.log('[AdminScanHistory] Photo paths:', 
            response.data.data.history.map(item => item.photo)
          );
          
          // Определяем режим хранения на основе первого URL
          const firstPhoto = response.data.data.history.find(item => item.photo);
          if (firstPhoto && firstPhoto.photo && firstPhoto.photo.startsWith('http')) {
            setStorageMode('cloudinary');
          }
        }
        
        setHistory(response.data.data.history);
        setTotalRows(response.data.data.total);
      } else {
        console.error('[AdminScanHistory] fetchScanHistory: API error', response.data);
        setSnackbar({ open: true, message: response.data.message || 'Не удалось загрузить историю сканирований', severity: 'error' });
      }
    } catch (error) {
      console.error('[AdminScanHistory] fetchScanHistory: catch error', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при загрузке данных', severity: 'error' });
    } finally {
      setLoading(false);
      console.log('[AdminScanHistory] fetchScanHistory: end');
    }
  };

  useEffect(() => {
    fetchScanHistory();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleOpenModal = (result) => {
    setSelectedResult(result);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Функции для обработки удаления
  const handleDeleteDialogOpen = (type) => {
    setDeleteDialog({ open: true, type, loading: false });
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialog({ open: false, type: '', loading: false });
  };

  const handleDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      let response;
      let successMessage;
      
      switch (deleteDialog.type) {
        case 'all':
          response = await apiService.adminScanHistory.deleteAll();
          successMessage = 'Вся история сканирований удалена';
          break;
        case 'old':
          response = await apiService.adminScanHistory.deleteOldFormat();
          successMessage = 'Старые записи удалены';
          break;
        default:
          throw new Error('Неизвестный тип удаления');
      }
      
      if (response.data.success) {
        setSnackbar({ 
          open: true, 
          message: `${successMessage}. Удалено записей: ${response.data.deletedCount}`, 
          severity: 'success' 
        });
        fetchScanHistory(); // Обновляем список
      } else {
        throw new Error(response.data.message || 'Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Произошла ошибка при удалении', 
        severity: 'error' 
      });
    } finally {
      handleDeleteDialogClose();
    }
  };

  // Форматирование данных о пользователе
  const formatUser = (user) => {
    if (!user) return 'Неизвестный пользователь';
    
    const userId = typeof user === 'string' ? user : user._id;
    
    // Если есть дополнительная информация о пользователе
    if (typeof user === 'object') {
      const { email, phone, authMethod, displayContact, name } = user;
      
      // Приоритет отображения: displayContact > email/phone по authMethod > любой доступный контакт
      let primaryContact = displayContact;
      if (!primaryContact) {
        primaryContact = authMethod === 'email' ? email : phone;
      }
      if (!primaryContact) {
        primaryContact = email || phone;
      }
      
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {primaryContact && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {(authMethod === 'email' || email === primaryContact) ? (
                <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
              ) : (
                <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
              )}
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {primaryContact}
              </Typography>
            </Box>
          )}
          {name && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
              {name}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, fontSize: '0.7rem' }}>
            ID: {userId?.slice(-8) || 'Неизвестно'}
          </Typography>
        </Box>
      );
    }
    
    // Если только ID
    return (
      <Typography variant="body2" sx={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
        ID: {userId?.slice(-8) || 'Неизвестно'}
      </Typography>
    );
  };

  // Форматирование фото с универсальной поддержкой
  const formatPhoto = (photoPath) => {
    if (!photoPath) return 'Нет фото';

    // Получаем URL изображения используя универсальную функцию
    const imagePath = getImageUrl(photoPath, storageMode);
    console.log('[AdminScanHistory] Формат фото:', { photoPath, storageMode, imagePath });
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        {/* Фото растения */}
        <Box
          component="img"
          src={imagePath}
          alt="Фото растения"
          sx={{
            width: 80,
            height: 80,
            objectFit: 'cover',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
          onClick={() => window.open(imagePath, '_blank')}
          onError={(e) => {
            console.error('[AdminScanHistory] Не удалось загрузить изображение:', imagePath);
            
            // Скрываем сломанное изображение и показываем заглушку
            e.target.style.display = 'none';
            
            // Создаем заглушку только если её ещё нет
            if (!e.target.nextElementSibling || !e.target.nextElementSibling.classList.contains('image-fallback')) {
              const fallbackIcon = document.createElement('div');
              fallbackIcon.className = 'image-fallback';
              fallbackIcon.style = `
                width: 80px;
                height: 80px;
                border-radius: 8px;
                background-color: rgba(0, 0, 0, 0.08);
                display: flex;
                justify-content: center;
                align-items: center;
                border: 1px dashed rgba(0, 0, 0, 0.2);
              `;
              fallbackIcon.innerHTML = `
                <svg style="width: 40px; height: 40px; color: rgba(0, 0, 0, 0.54);" 
                     focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path>
                </svg>
              `;
              e.target.parentNode.appendChild(fallbackIcon);
            }
          }}
        />
      </Box>
    );
  };

  // Форматирование названия растения
  const formatPlantName = (result) => {
    if (!result || !result.plant_info) return 'Нет данных';
    
    const plantInfo = result.plant_info;
    const name = plantInfo.name || 'Неизвестное растение';
    const latinName = plantInfo.latin_name;
    
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        {latinName && (
          <Typography variant="caption" color="text.secondary">
            <i>{latinName}</i>
          </Typography>
        )}
      </Box>
    );
  };

  // Форматирование результата с улучшенным отображением новой структуры
  const formatResult = (result) => {
    if (!result || !result.plant_info) return 'Нет данных';
    
    const plantInfo = result.plant_info;
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 300 }}>
        {/* Состояние растения */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip 
            label={plantInfo.is_healthy ? 'Здоровое' : 'Проблемы'} 
            color={plantInfo.is_healthy ? 'success' : 'error'}
            size="small"
          />
          {plantInfo.difficulty_level && (
            <Chip 
              icon={<DifficultyIcon />}
              label={plantInfo.difficulty_level === 'easy' ? 'Легкий' : 
                     plantInfo.difficulty_level === 'medium' ? 'Средний' : 'Сложный'}
              color={plantInfo.difficulty_level === 'easy' ? 'success' : 
                     plantInfo.difficulty_level === 'medium' ? 'warning' : 'error'}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Токсичность */}
        {plantInfo.toxicity && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ToxicityIcon fontSize="small" color="warning" />
            <Typography variant="caption" color="text.secondary">
              {plantInfo.toxicity.toxicity_level === 'non_toxic' ? '🟢 Безопасно' :
               plantInfo.toxicity.toxicity_level === 'mildly_toxic' ? '🟡 Слабо токсично' :
               plantInfo.toxicity.toxicity_level === 'toxic' ? '🟠 Токсично' :
               plantInfo.toxicity.toxicity_level === 'highly_toxic' ? '🔴 Очень токсично' :
               '❓ Неизвестно'}
            </Typography>
          </Box>
        )}

        {/* Автоматизация полива */}
        {plantInfo.care_info?.watering?.automation && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScheduleIcon fontSize="small" color="primary" />
            <Typography variant="caption">
              Полив: каждые {plantInfo.care_info.watering.automation.interval_days || '?'} дня,
              {plantInfo.care_info.watering.automation.time_of_day === 'morning' ? ' утром' :
               plantInfo.care_info.watering.automation.time_of_day === 'evening' ? ' вечером' :
               ' в любое время'}
            </Typography>
          </Box>
        )}

        {/* Температурный режим */}
        {plantInfo.growing_conditions?.temperature && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThermostatIcon fontSize="small" color="secondary" />
            <Typography variant="caption">
              Температура: {plantInfo.growing_conditions.temperature.optimal_min || plantInfo.growing_conditions.temperature.min || '?'}°
              -{plantInfo.growing_conditions.temperature.optimal_max || plantInfo.growing_conditions.temperature.max || '?'}°C
            </Typography>
          </Box>
        )}

        {/* Теги */}
        {plantInfo.tags && plantInfo.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {plantInfo.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
            {plantInfo.tags.length > 3 && (
              <Chip label={`+${plantInfo.tags.length - 3}`} size="small" variant="outlined" />
            )}
          </Box>
        )}
        
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => handleOpenModal(result)}
          sx={{ mt: 1, alignSelf: 'flex-start' }}
        >
          Подробнее
        </Button>
      </Box>
    );
  };

  // Форматирование рекомендаций
  const formatRecommendations = (result) => {
    if (!result || !result.plant_info) return 'Нет рекомендаций';
    
    const plantInfo = result.plant_info;
    
    // Собираем рекомендации
    let recommendations = [];
    
    // Добавляем информацию о поливе
    if (plantInfo.care_info && plantInfo.care_info.watering) {
      const watering = plantInfo.care_info.watering;
      if (watering.description || watering.frequency) {
        recommendations.push(
          <Box key="watering" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Полив:
            </Typography>
            <Typography variant="body2">
              {watering.description || watering.frequency}
            </Typography>
          </Box>
        );
      }
    }
    
    // Добавляем информацию о температуре
    if (plantInfo.care_info && plantInfo.care_info.temperature) {
      const temp = plantInfo.care_info.temperature;
      if (temp.optimal) {
        recommendations.push(
          <Box key="temp" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Температура:
            </Typography>
            <Typography variant="body2">
              {temp.optimal}
            </Typography>
          </Box>
        );
      }
    }
    
    // Добавляем информацию о болезнях/вредителях
    if (plantInfo.pests_and_diseases && plantInfo.pests_and_diseases.detected) {
      const pests = plantInfo.pests_and_diseases;
      
      if (pests.common_pests && pests.common_pests.length > 0) {
        recommendations.push(
          <Box key="pests" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              Вредители:
            </Typography>
            <Typography variant="body2">
              {pests.common_pests.join(', ')}
            </Typography>
          </Box>
        );
      }
      
      if (pests.common_diseases && pests.common_diseases.length > 0) {
        recommendations.push(
          <Box key="diseases" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              Болезни:
            </Typography>
            <Typography variant="body2">
              {pests.common_diseases.join(', ')}
            </Typography>
          </Box>
        );
      }
    }
    
    return recommendations.length > 0 ? (
      <Card variant="outlined" sx={{ boxShadow: 'none' }}>
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          {recommendations}
        </CardContent>
      </Card>
    ) : (
      'Нет рекомендаций'
    );
  };
  
  // Рендер полного модального окна с результатом
  const renderFullResultModal = () => {
    if (!selectedResult || !selectedResult.plant_info) return null;
    
    const plantInfo = selectedResult.plant_info;
    
    return (
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="result-modal-title"
        aria-describedby="result-modal-description"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" id="result-modal-title" sx={{ color: 'primary.main' }}>
              {plantInfo.name} {plantInfo.latin_name && plantInfo.latin_name !== 'data_not_available' && (
                <Typography component="span" variant="subtitle2" color="text.secondary">
                  ({plantInfo.latin_name})
                </Typography>
              )}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Основные характеристики */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DifficultyIcon color="primary" />
                    Общие характеристики
                  </Typography>
                  
                  <Stack spacing={1}>
                    {plantInfo.difficulty_level && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Сложность ухода:</Typography>
                        <Chip 
                          label={plantInfo.difficulty_level === 'easy' ? 'Легкий' : 
                                 plantInfo.difficulty_level === 'medium' ? 'Средний' : 'Сложный'}
                          color={plantInfo.difficulty_level === 'easy' ? 'success' : 
                                 plantInfo.difficulty_level === 'medium' ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>
                    )}
                    
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Состояние растения:</Typography>
                      <Chip 
                        label={plantInfo.is_healthy ? 'Здоровое' : 'Есть проблемы'} 
                        color={plantInfo.is_healthy ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>

                    {plantInfo.toxicity && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Токсичность:</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                          <Chip 
                            icon={<ToxicityIcon />}
                            label={plantInfo.toxicity.toxicity_level === 'non_toxic' ? 'Безопасно' :
                                   plantInfo.toxicity.toxicity_level === 'mildly_toxic' ? 'Слабо токсично' :
                                   plantInfo.toxicity.toxicity_level === 'toxic' ? 'Токсично' :
                                   plantInfo.toxicity.toxicity_level === 'highly_toxic' ? 'Очень токсично' :
                                   'Неизвестно'}
                            color={plantInfo.toxicity.toxicity_level === 'non_toxic' ? 'success' : 'warning'}
                            size="small"
                          />
                          {plantInfo.toxicity.toxic_to_pets !== null && (
                            <Chip 
                              label={plantInfo.toxicity.toxic_to_pets ? '❌ Опасно для животных' : '✅ Безопасно для животных'}
                              color={plantInfo.toxicity.toxic_to_pets ? 'error' : 'success'}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {plantInfo.toxicity.toxic_to_children !== null && (
                            <Chip 
                              label={plantInfo.toxicity.toxic_to_children ? '❌ Опасно для детей' : '✅ Безопасно для детей'}
                              color={plantInfo.toxicity.toxic_to_children ? 'error' : 'success'}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ThermostatIcon color="secondary" />
                    Условия содержания
                  </Typography>
                  
                  {plantInfo.growing_conditions && (
                    <Stack spacing={2}>
                      {plantInfo.growing_conditions.temperature && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>🌡️ Температура:</Typography>
                          <Typography variant="body2">
                            Оптимальная: {plantInfo.growing_conditions.temperature.optimal_min || plantInfo.growing_conditions.temperature.min}°-
                            {plantInfo.growing_conditions.temperature.optimal_max || plantInfo.growing_conditions.temperature.max}°C
                          </Typography>
                          {plantInfo.growing_conditions.temperature.winter_min && (
                            <Typography variant="caption" color="text.secondary">
                              Зимой не ниже: {plantInfo.growing_conditions.temperature.winter_min}°C
                            </Typography>
                          )}
                        </Box>
                      )}

                      {plantInfo.growing_conditions.lighting && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>☀️ Освещение:</Typography>
                          <Typography variant="body2">
                            {plantInfo.growing_conditions.lighting.type === 'direct_sun' ? 'Прямое солнце' :
                             plantInfo.growing_conditions.lighting.type === 'bright_indirect' ? 'Яркий рассеянный свет' :
                             plantInfo.growing_conditions.lighting.type === 'medium_light' ? 'Умеренное освещение' :
                             plantInfo.growing_conditions.lighting.type === 'low_light' ? 'Слабое освещение' :
                             plantInfo.growing_conditions.lighting.type}
                          </Typography>
                          {plantInfo.growing_conditions.lighting.hours_per_day && (
                            <Typography variant="caption" color="text.secondary">
                              {plantInfo.growing_conditions.lighting.hours_per_day} часов в день
                            </Typography>
                          )}
                        </Box>
                      )}

                      {plantInfo.growing_conditions.humidity && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>💧 Влажность:</Typography>
                          <Typography variant="body2">
                            {plantInfo.growing_conditions.humidity.optimal_percentage || 
                             `${plantInfo.growing_conditions.humidity.min_percentage}-${plantInfo.growing_conditions.humidity.max_percentage}`}%
                          </Typography>
                          {plantInfo.growing_conditions.humidity.misting_required && (
                            <Typography variant="caption" color="primary.main">
                              Требуется опрыскивание
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Уход и автоматизация */}
          {plantInfo.care_info && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="primary" />
                  Уход и автоматизация
                </Typography>
                
                <Grid container spacing={2}>
                  {plantInfo.care_info.watering && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          💧 Полив
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {plantInfo.care_info.watering.description}
                        </Typography>
                        {plantInfo.care_info.watering.automation && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'white', borderRadius: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Автоматизация:</Typography>
                            <Typography variant="caption" display="block">
                              • Каждые {plantInfo.care_info.watering.automation.interval_days || '?'} дня
                            </Typography>
                            <Typography variant="caption" display="block">
                              • Время: {plantInfo.care_info.watering.automation.time_of_day === 'morning' ? 'Утром' :
                                         plantInfo.care_info.watering.automation.time_of_day === 'evening' ? 'Вечером' : 'Любое время'}
                            </Typography>
                            {plantInfo.care_info.watering.automation.amount && plantInfo.care_info.watering.automation.amount !== 'data_not_available' && (
                              <Typography variant="caption" display="block">
                                • Количество: {plantInfo.care_info.watering.automation.amount}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {plantInfo.care_info.fertilizing && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(46, 125, 50, 0.04)', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          🌱 Подкормка
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {plantInfo.care_info.fertilizing.description}
                        </Typography>
                        {plantInfo.care_info.fertilizing.automation && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'white', borderRadius: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Автоматизация:</Typography>
                            <Typography variant="caption" display="block">
                              • Каждые {plantInfo.care_info.fertilizing.automation.interval_days || '?'} дней
                            </Typography>
                            {plantInfo.care_info.fertilizing.automation.fertilizer_type && plantInfo.care_info.fertilizing.automation.fertilizer_type !== 'data_not_available' && (
                              <Typography variant="caption" display="block">
                                • Тип: {plantInfo.care_info.fertilizing.automation.fertilizer_type}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Описание */}
          {plantInfo.description && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Описание</Typography>
                <Typography variant="body2">{plantInfo.description}</Typography>
              </CardContent>
            </Card>
          )}

          {/* Проблемы */}
          {plantInfo.pests_and_diseases?.common_problems && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  Анализ проблем растения
                </Typography>
                
                <Grid container spacing={1}>
                  {Object.entries(plantInfo.pests_and_diseases.common_problems).map(([problem, data]) => (
                    <Grid item xs={12} sm={6} md={4} key={problem}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          border: 1, 
                          borderColor: data.detected ? 'error.main' : 'grey.300',
                          bgcolor: data.detected ? 'rgba(211, 47, 47, 0.04)' : 'grey.50',
                          borderRadius: 1 
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 'bold',
                          color: data.detected ? 'error.main' : 'text.secondary'
                        }}>
                          {data.detected ? '🔴' : '🟢'} {
                            problem === 'yellow_leaves' ? 'Желтые листья' :
                            problem === 'brown_leaf_tips' ? 'Коричневые кончики' :
                            problem === 'dropping_leaves' ? 'Опадение листьев' :
                            problem === 'slow_growth' ? 'Медленный рост' :
                            problem === 'wilting' ? 'Увядание' : problem
                          }
                        </Typography>
                        {data.detected && data.causes && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Причины: {data.causes.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" onClick={handleCloseModal}>
              Закрыть
            </Button>
          </Box>
        </Box>
      </Modal>
    );
  };

  const columns = [
    { id: 'timestamp', label: 'Дата', minWidth: 170, format: (value) => value ? new Date(value).toLocaleString() : 'Нет даты' },
    { 
      id: 'user', 
      label: 'Пользователь', 
      minWidth: 200,
      format: (value) => formatUser(value)
    },
    { 
      id: 'photo', 
      label: 'Фото', 
      minWidth: 100,
      align: 'center',
      format: (value) => formatPhoto(value)
    },
    { 
      id: 'result', 
      label: 'Название растения', 
      minWidth: 200,
      format: (value) => formatPlantName(value)
    },
    { 
      id: 'result', 
      label: 'Результат', 
      minWidth: 250,
      format: (value) => formatResult(value)
    },
    { 
      id: 'result', 
      label: 'Рекомендации', 
      minWidth: 250,
      format: (value) => formatRecommendations(value)
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom component="h1" sx={{ color: 'primary.main' }}>
              История Сканирований Пользователей
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Просмотр всех сканирований растений, выполненных пользователями через мобильное приложение
            </Typography>
            {totalRows > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Всего записей: {totalRows}
              </Typography>
            )}
          </Box>
          
          {/* Кнопки управления */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Удалить записи со старой структурой данных">
              <Button
                variant="outlined"
                color="warning"
                startIcon={<CleaningServicesIcon />}
                onClick={() => handleDeleteDialogOpen('old')}
                size="small"
              >
                Очистить старые
              </Button>
            </Tooltip>
            
            <Tooltip title="Удалить ВСЮ историю сканирований">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={() => handleDeleteDialogOpen('all')}
                size="small"
              >
                Удалить всё
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id + column.label}
                        align={column.align}
                        style={{ 
                          minWidth: column.minWidth, 
                          fontWeight: 'bold',
                          backgroundColor: '#f5f5f5'
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.length > 0 ? (
                    history.map((row) => (
                      <TableRow 
                        hover 
                        role="checkbox" 
                        tabIndex={-1} 
                        key={row._id}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}
                      >
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id + column.label} align={column.align}>
                              {column.format ? column.format(value, row) : value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        <Box sx={{ py: 3 }}>
                          <Typography variant="h6" color="text.secondary">
                            Нет данных
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            История сканирований пуста
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalRows}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count !== -1 ? count : `больше чем ${to}`}`}
            />
          </>
        )}
      </Paper>
      
      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {deleteDialog.type === 'all' ? (
              <>
                Вы действительно хотите удалить <strong>ВСЮ</strong> историю сканирований?
                <br />
                <br />
                ⚠️ Это действие необратимо! Будут удалены все {totalRows} записей.
              </>
            ) : deleteDialog.type === 'old' ? (
              <>
                Удалить записи со старой структурой данных?
                <br />
                <br />
                Это безопасно удалит только устаревшие записи, которые не содержат новые поля 
                (difficulty_level, toxicity, automation и др.).
              </>
            ) : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={deleteDialog.loading}>
            Отмена
          </Button>
          <Button 
            onClick={handleDelete} 
            color={deleteDialog.type === 'all' ? 'error' : 'warning'}
            variant="contained"
            disabled={deleteDialog.loading}
            startIcon={deleteDialog.loading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteDialog.loading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {renderFullResultModal()}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminScanHistoryPage; 