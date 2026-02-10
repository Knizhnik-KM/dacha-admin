import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Chip, 
  Divider, 
  Skeleton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocationOn as LocationCityIcon
} from '@mui/icons-material';
import apiService from '../services/api';

const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // Состояние для данных
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояние для диалога блокировки
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Состояние для диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await apiService.users.getById(userId);
        
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        setError('Не удалось загрузить данные пользователя');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [userId]);
  
  // Обработчик открытия диалога блокировки
  const handleOpenBlockDialog = () => {
    setDialogOpen(true);
  };
  
  // Обработчик закрытия диалога блокировки
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Обработчик блокировки/разблокировки пользователя
  const handleToggleBlock = async () => {
    try {
      setActionLoading(true);
      const response = await apiService.users.toggleBlock(userId);
      
      if (response.data.success) {
        // Обновляем данные пользователя
        setUser({ ...user, isBlocked: !user.isBlocked });
        
        // Показываем уведомление
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Ошибка блокировки/разблокировки пользователя:', error);
      setSnackbar({
        open: true,
        message: 'Не удалось выполнить операцию',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
      handleCloseDialog();
    }
  };
  
  // Обработчик открытия диалога удаления
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };
  
  // Обработчик закрытия диалога удаления
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Обработчик удаления пользователя
  const handleDeleteUser = async () => {
    try {
      setDeleteLoading(true);
      const response = await apiService.users.deleteUser(userId);
      
      if (response.data.success) {
        // Показываем уведомление
        setSnackbar({
          open: true,
          message: 'Пользователь успешно удален',
          severity: 'success'
        });
        
        // Перенаправляем на страницу со списком пользователей
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      setDeleteLoading(false);
      setSnackbar({
        open: true,
        message: 'Не удалось удалить пользователя',
        severity: 'error'
      });
      handleCloseDeleteDialog();
    }
  };
  
  // Обработчик закрытия уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Компонент для отображения информации
  const InfoItem = ({ icon, label, value, loading }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ mr: 2, color: 'text.secondary' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={150} height={24} />
        ) : (
          <Typography variant="body1">
            {value || 'Нет данных'}
          </Typography>
        )}
      </Box>
    </Box>
  );
  
  return (
    <Box>
      {/* Заголовок с кнопкой назад */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mr: 2 }}
        >
          Назад к списку
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Информация о пользователе
        </Typography>
      </Box>
      
      {/* Ошибка загрузки */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Основная информация */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={3}>
          {/* Левая колонка */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Основная информация
            </Typography>
            
            <InfoItem 
              icon={user?.authMethod === 'email' ? <EmailIcon /> : <PhoneIcon />}
              label="Контакт"
              value={user?.email || user?.phone}
              loading={loading}
            />
            
            <InfoItem 
              icon={<PersonIcon />}
              label="Имя"
              value={user?.name}
              loading={loading}
            />
            
            <InfoItem 
              icon={<LocationCityIcon />}
              label="Город"
              value={user?.city}
              loading={loading}
            />
            
            <InfoItem 
              icon={<CalendarIcon />}
              label="Дата регистрации"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleString() : null}
              loading={loading}
            />
            
            <InfoItem 
              icon={<TimeIcon />}
              label="Последний вход"
              value={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : null}
              loading={loading}
            />
          </Grid>
          
          {/* Правая колонка */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Статус и верификация
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Статус аккаунта
              </Typography>
              {loading ? (
                <Skeleton width={100} height={32} />
              ) : (
                <Chip 
                  icon={user?.isBlocked ? <BlockIcon /> : <CheckCircleIcon />}
                  label={user?.isBlocked ? 'Заблокирован' : 'Активен'} 
                  color={user?.isBlocked ? 'error' : 'success'} 
                  variant="outlined"
                />
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Метод авторизации
              </Typography>
              {loading ? (
                <Skeleton width={100} height={32} />
              ) : (
                <Chip 
                  icon={user?.authMethod === 'email' ? <EmailIcon /> : <PhoneIcon />}
                  label={user?.authMethod === 'email' ? 'Email' : 'Телефон'} 
                  color={user?.authMethod === 'email' ? 'info' : 'warning'} 
                  variant="outlined"
                />
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Статус верификации
              </Typography>
              {loading ? (
                <Skeleton width={100} height={32} />
              ) : (
                <Chip 
                  icon={
                    (user?.authMethod === 'email' && user?.isEmailVerified) || 
                    (user?.authMethod === 'phone' && user?.isPhoneVerified) 
                      ? <CheckCircleIcon /> 
                      : <BlockIcon />
                  }
                  label={
                    (user?.authMethod === 'email' && user?.isEmailVerified) || 
                    (user?.authMethod === 'phone' && user?.isPhoneVerified) 
                      ? 'Подтвержден' 
                      : 'Не подтвержден'
                  } 
                  color={
                    (user?.authMethod === 'email' && user?.isEmailVerified) || 
                    (user?.authMethod === 'phone' && user?.isPhoneVerified) 
                      ? 'success' 
                      : 'error'
                  } 
                  variant="outlined"
                />
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Действия */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleOpenDeleteDialog}
            disabled={loading}
          >
            Удалить пользователя
          </Button>
          <Button
            variant="contained"
            color={user?.isBlocked ? 'success' : 'error'}
            onClick={handleOpenBlockDialog}
            disabled={loading}
          >
            {user?.isBlocked ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}
          </Button>
        </Box>
      </Paper>
      
      {/* Диалог блокировки/разблокировки */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {user?.isBlocked ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {user?.isBlocked 
              ? 'Вы уверены, что хотите разблокировать этого пользователя? Он снова сможет использовать приложение.'
              : 'Вы уверены, что хотите заблокировать этого пользователя? Он не сможет использовать приложение до разблокировки.'}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Контакт: {user?.email || user?.phone}
            </Typography>
            <Typography variant="subtitle2">
              Метод: {user?.authMethod === 'email' ? 'Email' : 'Телефон'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>
            Отмена
          </Button>
          <Button 
            onClick={handleToggleBlock} 
            color={user?.isBlocked ? 'success' : 'error'} 
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading && <CircularProgress size={20} color="inherit" />}
          >
            {user?.isBlocked ? 'Разблокировать' : 'Заблокировать'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          Удалить пользователя?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите полностью удалить этого пользователя? Это действие невозможно отменить.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Контакт: {user?.email || user?.phone}
            </Typography>
            <Typography variant="subtitle2">
              Метод: {user?.authMethod === 'email' ? 'Email' : 'Телефон'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} color="inherit" />}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомление */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDetailsPage; 