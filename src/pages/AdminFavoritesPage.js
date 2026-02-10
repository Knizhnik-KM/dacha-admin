import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Badge
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  LocalFlorist as PlantIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import apiService from '../services/api';
import { getImageUrl } from '../config/api.config';

const AdminFavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentFavorite, setCurrentFavorite] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({ total: 0, byType: [], topUsers: [] });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.adminFavorites.getFavorites(page + 1, pageSize, searchTerm, '', filterType === 'all' ? '' : filterType);
      if (response.data.success) {
        setFavorites(response.data.data.favorites || []);
        setTotalRows(response.data.data.total || 0);
      } else {
        setSnackbar({ open: true, message: 'Не удалось загрузить избранное', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при загрузке', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, filterType]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // Простая статистика на основе загруженных данных
      const response = await apiService.adminFavorites.getFavorites(1, 1000, '', '', '');
      if (response.data.success) {
        const allFavorites = response.data.data.favorites || [];
        
        const byType = {};
        const userCounts = {};
        
        allFavorites.forEach(fav => {
          byType[fav.itemType] = (byType[fav.itemType] || 0) + 1;
          const userId = fav.user?._id || fav.user;
          userCounts[userId] = (userCounts[userId] || 0) + 1;
        });
        
        const topUsers = Object.entries(userCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([userId, count]) => {
            const user = allFavorites.find(f => (f.user?._id || f.user) === userId)?.user;
            return {
              user: user || { _id: userId },
              count
            };
          });
        
        setStats({
          total: allFavorites.length,
          byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
          topUsers
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearchSubmit = () => {
    setPage(0);
    fetchFavorites();
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
    fetchFavorites();
  };

  const handleDeleteFavorite = async () => {
    if (!currentFavorite) return;
    try {
      const response = await apiService.adminFavorites.deleteFavorite(currentFavorite._id);
      if (response.data.success) {
        fetchFavorites();
        fetchStats();
        setSnackbar({ open: true, message: 'Запись удалена из избранного', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Не удалось удалить запись', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Ошибка при удалении', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setCurrentFavorite(null);
  };

  // Форматирование пользователя
  const formatUser = (user) => {
    if (!user) return { name: 'Неизвестный пользователь', contact: '', avatar: null };
    
    const name = user.name || 'Пользователь';
    const contact = user.email || user.phone || 'Нет контакта';
    const authMethod = user.authMethod;
    
    return { name, contact, authMethod, avatar: name.charAt(0).toUpperCase() };
  };

  // Форматирование фото растения (как в PlantsPage)
  const formatPhoto = (plant) => {
    if (!plant) {
      return (
        <Box sx={{ 
          width: 60, 
          height: 60, 
          bgcolor: 'grey.100', 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <PlantIcon sx={{ color: 'grey.400' }} />
        </Box>
      );
    }

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
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 1,
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
                    width: 60px; height: 60px; border-radius: 4px; background-color: rgba(0, 0, 0, 0.08);
                    display: flex; justify-content: center; align-items: center; border: 1px dashed rgba(0, 0, 0, 0.2);
                  `;
                  fallbackIcon.innerHTML = `<svg style="width: 30px; height: 30px; color: rgba(0, 0, 0, 0.54);" viewBox="0 0 24 24">
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
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 1,
              cursor: 'pointer',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.1)' }
            }}
            onClick={() => window.open(imagePath, '_blank')}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ 
        width: 60, 
        height: 60, 
        bgcolor: 'grey.100', 
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <PlantIcon sx={{ color: 'grey.400' }} />
      </Box>
    );
  };

  // Форматирование названия растения
  const formatPlantName = (plant) => {
    if (!plant) {
      return {
        name: 'Неизвестное растение',
        latinName: '',
        isHealthy: undefined
      };
    }
    
    return {
      name: plant.name || 'Неизвестное растение',
      latinName: plant.latin_name || plant.species || '',
      isHealthy: plant.is_healthy
    };
  };

  // Рендер статистики
  const renderStats = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FavoriteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Всего избранного</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {stats.total}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PlantIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">По типам</Typography>
            </Box>
            {stats.byType.map(({ type, count }) => (
              <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Chip label={type} size="small" />
                <Typography variant="body2" fontWeight="bold">{count}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Топ пользователи</Typography>
            </Box>
            {stats.topUsers.slice(0, 3).map((userStat, idx) => {
              const userInfo = formatUser(userStat.user);
              return (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                    {userInfo.avatar}
                  </Avatar>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {userInfo.name}
                  </Typography>
                  <Badge badgeContent={userStat.count} color="primary" />
                </Box>
              );
            })}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Избранное пользователей
      </Typography>

      {/* Статистика */}
      {!statsLoading && renderStats()}

      {/* Фильтры и поиск */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField 
              fullWidth
              size="small"
              placeholder="Поиск по пользователю, растению..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Тип"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="plant">Растения</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Button 
              variant="contained" 
              onClick={handleSearchSubmit}
              fullWidth
              sx={{ height: '40px' }}
            >
              Найти
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell width="80">Фото</TableCell>
                <TableCell>Растение</TableCell>
                <TableCell>Пользователь</TableCell>
                <TableCell width="150">Дата добавления</TableCell>
                <TableCell width="120">Статус</TableCell>
                <TableCell width="100">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : favorites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <FavoriteIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Избранного не найдено
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                favorites.map((favorite) => {
                  const userInfo = formatUser(favorite.user);
                  const plant = favorite.item; // Прямо получаем растение
                  const plantInfo = formatPlantName(plant); // Форматируем только название
                  
                  return (
                    <TableRow key={favorite._id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      {/* Фото растения */}
                      <TableCell>
                        {formatPhoto(plant)}
                      </TableCell>
                      
                      {/* Информация о растении */}
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {plantInfo.name}
                          </Typography>
                          {plantInfo.latinName && (
                            <Typography variant="caption" color="text.secondary">
                              <i>{plantInfo.latinName}</i>
                            </Typography>
                          )}
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              label={favorite.itemType}
                              size="small" 
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            {plantInfo.isHealthy !== undefined && (
                              <Chip 
                                label={plantInfo.isHealthy ? 'Здоровое' : 'Проблемы'}
                                size="small"
                                color={plantInfo.isHealthy ? 'success' : 'error'}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      
                      {/* Информация о пользователе */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
                            {userInfo.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {userInfo.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              {userInfo.authMethod === 'email' ? (
                                <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              ) : (
                                <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {userInfo.contact}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              ID: {(favorite.user?._id || favorite.user || '').slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      {/* Дата добавления */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {favorite.addedAt ? new Date(favorite.addedAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {favorite.addedAt ? new Date(favorite.addedAt).toLocaleTimeString('ru-RU') : ''}
                        </Typography>
                      </TableCell>
                      
                      {/* Статус */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FavoriteIcon color="error" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="error">
                            В избранном
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      {/* Действия */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Удалить из избранного">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => {
                                setCurrentFavorite(favorite);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Пагинация */}
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить из избранного</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить это растение из избранного пользователя?
            {currentFavorite && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Растение:</strong> {formatPlantName(currentFavorite.item).name}
                </Typography>
                <Typography variant="body2">
                  <strong>Пользователь:</strong> {formatUser(currentFavorite.user).name}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteFavorite} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminFavoritesPage; 