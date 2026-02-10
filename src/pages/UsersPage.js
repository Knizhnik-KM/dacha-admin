import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import apiService from '../services/api';

const UsersPage = () => {
  const navigate = useNavigate();
  
  // Состояние для данных
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Состояние для диалога блокировки
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Состояние для диалога удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Загрузка данных
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.users.getAll(page + 1, pageSize, search);
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalUsers(response.data.data.total);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setSnackbar({
        open: true,
        message: 'Не удалось загрузить список пользователей',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка данных при изменении параметров
  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);
  
  // Обработчик поиска
  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };
  
  // Обработчик очистки поиска
  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
    fetchUsers();
  };
  
  // Обработчик нажатия Enter в поле поиска
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Обработчик открытия диалога блокировки
  const handleOpenBlockDialog = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };
  
  // Обработчик закрытия диалога блокировки
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };
  
  // Обработчик блокировки/разблокировки пользователя
  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const response = await apiService.users.toggleBlock(selectedUser._id);
      
      if (response.data.success) {
        // Обновляем пользователя в списке
        setUsers(users.map(user => 
          user._id === selectedUser._id 
            ? { ...user, isBlocked: !user.isBlocked } 
            : user
        ));
        
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
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  // Обработчик закрытия диалога удаления
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  // Обработчик удаления пользователя
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleteLoading(true);
      const response = await apiService.users.deleteUser(userToDelete._id);
      
      if (response.data.success) {
        // Удаляем пользователя из списка
        setUsers(users.filter(user => user._id !== userToDelete._id));
        
        // Показываем уведомление
        setSnackbar({
          open: true,
          message: 'Пользователь успешно удален',
          severity: 'success'
        });
        
        // Обновляем общее количество
        setTotalUsers(prev => prev - 1);
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      setSnackbar({
        open: true,
        message: 'Не удалось удалить пользователя',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      handleCloseDeleteDialog();
    }
  };
  
  // Обработчик закрытия уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Колонки для таблицы
  const columns = [
    { 
      field: 'contact', 
      headerName: 'Контакт', 
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.row.authMethod === 'email' ? (
            <EmailIcon color="info" sx={{ mr: 1 }} />
          ) : (
            <PhoneIcon color="warning" sx={{ mr: 1 }} />
          )}
          <Typography>{params.row.email || params.row.phone}</Typography>
        </Box>
      )
    },
    { 
      field: 'name', 
      headerName: 'Имя', 
      width: 160,
      valueGetter: (params) => params.row.name || 'Не указано'
    },
    { 
      field: 'city', 
      headerName: 'Город', 
      width: 160,
      valueGetter: (params) => params.row.city || 'Не указан'
    },
    { 
      field: 'authMethod', 
      headerName: 'Метод', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'email' ? 'Email' : 'Телефон'} 
          color={params.value === 'email' ? 'info' : 'warning'} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { 
      field: 'isBlocked', 
      headerName: 'Статус', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          icon={params.value ? <BlockIcon /> : <CheckCircleIcon />}
          label={params.value ? 'Заблокирован' : 'Активен'} 
          color={params.value ? 'error' : 'success'} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Дата регистрации', 
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: 'lastLogin', 
      headerName: 'Последний вход', 
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'Нет данных'
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          justifyContent: 'space-around',
          gap: 1,
          width: '100%'
        }}>
          <IconButton
            size="small"
            color={params.row.isBlocked ? 'success' : 'error'}
            onClick={() => handleOpenBlockDialog(params.row)}
            title={params.row.isBlocked ? 'Разблокировать' : 'Заблокировать'}
          >
            {params.row.isBlocked ? <LockOpenIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate(`/users/${params.row._id}`)}
            title="Детали"
          >
            <InfoIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleOpenDeleteDialog(params.row)}
            title="Удалить"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Пользователи
      </Typography>
      
      {/* Поиск */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <TextField
          fullWidth
          placeholder="Поиск по email или телефону"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mr: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={handleSearch}
          disabled={loading}
        >
          Поиск
        </Button>
      </Paper>
      
      {/* Таблица пользователей */}
      <Paper 
        elevation={0} 
        sx={{ 
          height: 600, 
          width: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          }
        }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          pagination
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25, 50]}
          rowCount={totalUsers}
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row._id}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
            }
          }}
        />
      </Paper>
      
      {/* Диалог блокировки/разблокировки */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {selectedUser?.isBlocked ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.isBlocked 
              ? 'Вы уверены, что хотите разблокировать этого пользователя? Он снова сможет использовать приложение.'
              : 'Вы уверены, что хотите заблокировать этого пользователя? Он не сможет использовать приложение до разблокировки.'}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Контакт: {selectedUser?.email || selectedUser?.phone}
            </Typography>
            <Typography variant="subtitle2">
              Метод: {selectedUser?.authMethod === 'email' ? 'Email' : 'Телефон'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>
            Отмена
          </Button>
          <Button 
            onClick={handleToggleBlock} 
            color={selectedUser?.isBlocked ? 'success' : 'error'} 
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading && <CircularProgress size={20} color="inherit" />}
          >
            {selectedUser?.isBlocked ? 'Разблокировать' : 'Заблокировать'}
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
              Контакт: {userToDelete?.email || userToDelete?.phone}
            </Typography>
            <Typography variant="subtitle2">
              Метод: {userToDelete?.authMethod === 'email' ? 'Email' : 'Телефон'}
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

export default UsersPage; 