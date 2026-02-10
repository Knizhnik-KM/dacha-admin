import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  Snackbar, Alert, CircularProgress, MenuItem, Grid, Divider, Card, CardContent, CardMedia, Chip, Avatar, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalFlorist as PlantIcon,
  BarChart as BarChartIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  WaterDrop as WaterIcon,
  Thermostat as ThermostatIcon,
  Schedule as ScheduleIcon,
  Warning as ToxicityIcon,
  Star as DifficultyIcon,
  Pets as PetsIcon,
  ChildCare as ChildIcon,
  Image as ImageIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import apiService from '../services/api';
import { getImageUrl } from '../config/api.config';

const PlantsPage = () => {
  // Состояния
  const [plants, setPlants] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({ total: 0, bySpecies: [] });
  const [statsLoading, setStatsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [viewMode, setViewMode] = useState('cards'); // 'cards' или 'table'

  // Загрузка растений
  const fetchPlants = async () => {
    setLoading(true);
    try {
      const res = await apiService.adminPlants.getAll(page + 1, pageSize, search, species);
      if (res.data.success) {
        setPlants(res.data.data);
        setTotal(res.data.total);
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'Ошибка загрузки растений', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Загрузка статистики
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await apiService.adminPlants.getStats();
      if (res.data.success) setStats(res.data);
    } catch (e) {
      setStats({ total: 0, bySpecies: [] });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, [page, pageSize]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Поиск
  const handleSearch = () => {
    setPage(0);
    fetchPlants();
  };
  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
    fetchPlants();
  };

  // Развертывание строк
  const handleExpandRow = (plantId) => {
    setExpandedRows(prev => ({
      ...prev,
      [plantId]: !prev[plantId]
    }));
  };

  // Форматирование фото
  const formatPhoto = (plant) => {
    // Проверяем images из сканирования
    if (plant.images) {
      const imageUrl = plant.images.main_image || plant.images.original || plant.images.user_image || plant.images.thumbnail;
      if (imageUrl) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <Box
              component="img"
              src={imageUrl}
              alt="Фото растения"
              sx={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.1)' }
              }}
              onClick={() => window.open(imageUrl, '_blank')}
              onError={(e) => {
                e.target.style.display = 'none';
                if (!e.target.nextElementSibling || !e.target.nextElementSibling.classList.contains('image-fallback')) {
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.className = 'image-fallback';
                  fallbackIcon.style = `
                    width: 80px; height: 80px; border-radius: 8px; background-color: rgba(0, 0, 0, 0.08);
                    display: flex; justify-content: center; align-items: center; border: 1px dashed rgba(0, 0, 0, 0.2);
                  `;
                  fallbackIcon.innerHTML = `<svg style="width: 40px; height: 40px; color: rgba(0, 0, 0, 0.54);" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path>
                  </svg>`;
                  e.target.parentNode.appendChild(fallbackIcon);
                }
              }}
            />
          </Box>
        );
      }
    }

    // Fallback на старое поле photo
    if (plant.photo) {
      const imagePath = getImageUrl(plant.photo);
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
              '&:hover': { transform: 'scale(1.1)' }
            }}
            onClick={() => window.open(imagePath, '_blank')}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 80, height: 80, bgcolor: 'grey.100', borderRadius: '8px' }}>
        <ImageIcon sx={{ color: 'grey.400', fontSize: 40 }} />
      </Box>
    );
  };

  // Форматирование названия растения
  const formatPlantName = (plant) => {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {plant.name || 'Неизвестное растение'}
        </Typography>
        {plant.latin_name && (
          <Typography variant="caption" color="text.secondary">
            <i>{plant.latin_name}</i>
          </Typography>
        )}
      </Box>
    );
  };

  // Форматирование пользователя
  const formatUser = (user) => {
    if (!user) return 'Неизвестный пользователь';
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {user.name || user.email || user.phone || 'Неизвестно'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ID: {user._id?.slice(-8) || 'Неизвестно'}
        </Typography>
      </Box>
    );
  };

  // Форматирование подробной информации
  const formatDetailedInfo = (plant) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        {/* Состояние и здоровье */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={plant.is_healthy ? 'Здоровое' : 'Проблемы'} 
            color={plant.is_healthy ? 'success' : 'error'}
            size="small"
          />
          {plant.difficulty_level && (
            <Chip 
              icon={<DifficultyIcon />}
              label={plant.difficulty_level === 'easy' ? 'Легкий уход' : 
                     plant.difficulty_level === 'medium' ? 'Средний уход' : 'Сложный уход'}
              color={plant.difficulty_level === 'easy' ? 'success' : 
                     plant.difficulty_level === 'medium' ? 'warning' : 'error'}
              size="small"
              variant="outlined"
            />
          )}
          {plant.tags && plant.tags.length > 0 && plant.tags.map((tag, idx) => (
            <Chip key={idx} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        {/* Описание */}
        {plant.description && (
          <Typography variant="body2" color="text.secondary">
            {plant.description}
          </Typography>
        )}

        {/* Токсичность */}
        {plant.toxicity && plant.toxicity.toxicity_level && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ToxicityIcon fontSize="small" color="warning" />
            <Typography variant="caption">
              {plant.toxicity.toxicity_level === 'non_toxic' ? '🟢 Безопасно' :
               plant.toxicity.toxicity_level === 'mildly_toxic' ? '🟡 Слабо токсично' :
               plant.toxicity.toxicity_level === 'toxic' ? '🟠 Токсично' :
               plant.toxicity.toxicity_level === 'highly_toxic' ? '🔴 Очень токсично' :
               '❓ Неизвестно'}
            </Typography>
            {plant.toxicity.toxic_to_pets && (
              <Tooltip title="Токсично для животных">
                <PetsIcon fontSize="small" color="warning" />
              </Tooltip>
            )}
            {plant.toxicity.toxic_to_children && (
              <Tooltip title="Токсично для детей">
                <ChildIcon fontSize="small" color="warning" />
              </Tooltip>
            )}
          </Box>
        )}

        {/* Уход */}
        {plant.care_info?.watering?.automation && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WaterIcon fontSize="small" color="primary" />
            <Typography variant="caption">
              Полив: каждые {plant.care_info.watering.automation.interval_days || '?'} дня
              {plant.care_info.watering.automation.time_of_day === 'morning' ? ', утром' :
               plant.care_info.watering.automation.time_of_day === 'evening' ? ', вечером' : ''}
            </Typography>
          </Box>
        )}

        {/* Температура */}
        {plant.growing_conditions?.temperature && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThermostatIcon fontSize="small" color="secondary" />
            <Typography variant="caption">
              Температура: {plant.growing_conditions.temperature.optimal_min || plant.growing_conditions.temperature.min || '?'}°
              -{plant.growing_conditions.temperature.optimal_max || plant.growing_conditions.temperature.max || '?'}°C
            </Typography>
          </Box>
        )}

        {/* Освещение */}
        {plant.growing_conditions?.lighting?.type && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption">
              ☀️ Освещение: {
                plant.growing_conditions.lighting.type === 'direct_sun' ? 'Прямое солнце' :
                plant.growing_conditions.lighting.type === 'bright_indirect' ? 'Яркий рассеянный свет' :
                plant.growing_conditions.lighting.type === 'medium_light' ? 'Умеренное освещение' :
                plant.growing_conditions.lighting.type === 'low_light' ? 'Тенелюбивое' :
                'Не указано'
              }
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Открыть/закрыть диалог редактирования
  const handleOpenEditDialog = (plant) => {
    setSelectedPlant(plant);
    setEditDialogOpen(true);
  };
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedPlant(null);
  };

  // Сохранить изменения
  const handleSaveEdit = async () => {
    if (!selectedPlant) return;
    setEditLoading(true);
    try {
      const res = await apiService.adminPlants.update(selectedPlant._id, selectedPlant);
      if (res.data.success) {
        setSnackbar({ open: true, message: 'Растение обновлено', severity: 'success' });
        fetchPlants();
        handleCloseEditDialog();
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'Ошибка обновления', severity: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  // Удаление
  const handleOpenDeleteDialog = (plant) => {
    setPlantToDelete(plant);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPlantToDelete(null);
  };
  const handleDeletePlant = async () => {
    if (!plantToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await apiService.adminPlants.delete(plantToDelete._id);
      if (res.data.success) {
        setSnackbar({ open: true, message: 'Растение удалено', severity: 'success' });
        fetchPlants();
        handleCloseDeleteDialog();
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'Ошибка удаления', severity: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Рендер таблицы
  const renderTable = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell width="100">Фото</TableCell>
            <TableCell>Растение</TableCell>
            <TableCell>Пользователь</TableCell>
            <TableCell width="120">Дата добавления</TableCell>
            <TableCell width="120">Действия</TableCell>
            <TableCell width="40">Детали</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plants.map((plant) => (
            <React.Fragment key={plant._id}>
              <TableRow sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                <TableCell>{formatPhoto(plant)}</TableCell>
                <TableCell>{formatPlantName(plant)}</TableCell>
                <TableCell>{formatUser(plant.user)}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {plant.addedAt ? new Date(plant.addedAt).toLocaleDateString() : 'Неизвестно'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton color="primary" size="small" onClick={() => handleOpenEditDialog(plant)} title="Редактировать">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(plant)} title="Удалить">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleExpandRow(plant._id)}>
                    {expandedRows[plant._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
              {expandedRows[plant._id] && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 0 }}>
                    <Collapse in={expandedRows[plant._id]} timeout="auto" unmountOnExit>
                      {formatDetailedInfo(plant)}
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`}
      />
    </TableContainer>
  );

  // Рендер карточек
  const renderCards = () => (
    <>
      <Grid container spacing={3}>
        {plants.map((plant) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={plant._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              {/* Изображение */}
              <Box sx={{ position: 'relative' }}>
                {plant.images && (plant.images.main_image || plant.images.original || plant.images.user_image) ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={plant.images.main_image || plant.images.original || plant.images.user_image}
                    alt={plant.name}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => window.open(plant.images.main_image || plant.images.original || plant.images.user_image, '_blank')}
                  />
                ) : plant.photo ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(plant.photo)}
                    alt={plant.name}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => window.open(getImageUrl(plant.photo), '_blank')}
                  />
                ) : (
                  <Box sx={{ 
                    height: 200, 
                    bgcolor: 'grey.100', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <PlantIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                  </Box>
                )}
                
                {/* Статус в углу */}
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <Chip 
                    label={plant.is_healthy ? 'Здоровое' : 'Проблемы'} 
                    color={plant.is_healthy ? 'success' : 'error'}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                  />
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Название */}
                {formatPlantName(plant)}
                
                {/* Пользователь */}
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Владелец: {plant.user?.name || plant.user?.email || plant.user?.phone || 'Неизвестно'}
                  </Typography>
                </Box>

                {/* Теги */}
                {plant.tags && plant.tags.length > 0 && (
                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {plant.tags.slice(0, 3).map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" variant="outlined" />
                    ))}
                    {plant.tags.length > 3 && (
                      <Chip label={`+${plant.tags.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>
                )}

                {/* Краткая информация */}
                <Box sx={{ mt: 'auto' }}>
                  {plant.care_info?.watering?.automation && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <WaterIcon fontSize="small" color="primary" />
                      <Typography variant="caption">
                        Каждые {plant.care_info.watering.automation.interval_days || '?'} дня
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    Добавлено: {plant.addedAt ? new Date(plant.addedAt).toLocaleDateString() : 'Неизвестно'}
                  </Typography>
                </Box>

                {/* Действия */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button 
                    size="small" 
                    startIcon={<ViewIcon />}
                    onClick={() => handleExpandRow(plant._id)}
                  >
                    {expandedRows[plant._id] ? 'Скрыть' : 'Подробнее'}
                  </Button>
                  <Box>
                    <IconButton color="primary" size="small" onClick={() => handleOpenEditDialog(plant)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(plant)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Развернутая информация */}
                <Collapse in={expandedRows[plant._id]} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    {formatDetailedInfo(plant)}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Пагинация для карточек */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Элементов на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`}
        />
      </Box>
    </>
  );

  // Основной рендер
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Коллекция растений пользователей
      </Typography>

      {/* Поиск и фильтры */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Поиск по названию"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              fullWidth
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {search ? (
                      <IconButton size="small" onClick={handleClearSearch}><ClearIcon /></IconButton>
                    ) : (
                      <SearchIcon color="action" />
                    )}
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Вид растения"
              value={species}
              onChange={e => setSpecies(e.target.value)}
              select
              fullWidth
              size="small"
            >
              <MenuItem value="">Все</MenuItem>
              {stats.bySpecies.map(s => (
                <MenuItem key={s._id} value={s._id}>{s._id} ({s.count})</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" color="primary" onClick={handleSearch} fullWidth sx={{ height: '40px' }}>
              Найти
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('cards')}
              fullWidth
              sx={{ height: '40px' }}
            >
              Карточки
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
              fullWidth
              sx={{ height: '40px' }}
            >
              Таблица
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Основное содержимое */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : plants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <PlantIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Растения не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте изменить критерии поиска
          </Typography>
        </Paper>
      ) : (
        viewMode === 'cards' ? renderCards() : renderTable()
      )}

      {/* Статистика */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Статистика по растениям
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {statsLoading ? (
          <CircularProgress size={32} />
        ) : (
          <Box>
            <Typography>Всего растений: <b>{stats.total}</b></Typography>
            <Box sx={{ mt: 2 }}>
              {stats.bySpecies.length > 0 ? stats.bySpecies.map(s => (
                <Typography key={s._id}>{s._id || 'Не указан'}: <b>{s.count}</b></Typography>
              )) : 'Нет данных по видам'}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать растение</DialogTitle>
        <DialogContent>
          {selectedPlant && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Название"
                value={selectedPlant.name || ''}
                onChange={e => setSelectedPlant({ ...selectedPlant, name: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Латинское название"
                value={selectedPlant.latin_name || selectedPlant.species || ''}
                onChange={e => setSelectedPlant({ ...selectedPlant, latin_name: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Состояние"
                value={selectedPlant.state || ''}
                onChange={e => setSelectedPlant({ ...selectedPlant, state: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Рекомендации"
                value={selectedPlant.recommendations || ''}
                onChange={e => setSelectedPlant({ ...selectedPlant, recommendations: e.target.value })}
                fullWidth
                size="small"
                multiline
                minRows={2}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Отмена</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={editLoading}>
            {editLoading ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Удалить растение</DialogTitle>
        <DialogContent>Вы уверены, что хотите удалить это растение?</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeletePlant} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlantsPage; 