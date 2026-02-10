import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Tooltip,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Container,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import apiService from '../services/api';

// Примерные статусы и типы, их можно будет расширить или брать с бэкенда
const notificationTypes = [
  { value: 'reminder', label: 'Напоминание' },
  { value: 'achievement', label: 'Достижение' },
  { value: 'system', label: 'Системное' },
  { value: 'chat_message', label: 'Новое сообщение в чате' },
  { value: 'product_update', label: 'Обновление товара' },
];

const notificationStatuses = [
  { value: 'sent', label: 'Отправлено' },
  { value: 'delivered', label: 'Доставлено' },
  { value: 'failed', label: 'Ошибка доставки' },
  { value: 'pending', label: 'В ожидании' },
];

const AdminNotificationLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUserId, setFilterUserId] = useState(''); // Для фильтрации по ID пользователя

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.adminNotificationLogs.getNotificationLogs(
        page + 1, 
        pageSize, 
        searchTerm, 
        filterUserId, 
        filterType, 
        filterStatus
      );
      if (response.data.success) {
        setLogs(response.data.data.logs.map(log => ({...log, id: log._id })));
        setTotalRows(response.data.data.total);
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось загрузить логи уведомлений', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка загрузки логов уведомлений:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при загрузке логов', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, filterUserId, filterType, filterStatus]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleUserIdChange = (event) => setFilterUserId(event.target.value);
  const handleTypeChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };
  const handleStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleSearchSubmit = () => {
    setPage(0);
    fetchLogs();
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterUserId('');
    setFilterType('');
    setFilterStatus('');
    setPage(0);
    if (!searchTerm && !filterUserId && !filterType && !filterStatus) {
        fetchLogs();
    }
  };

  const handleOpenViewDialog = (log) => {
    setCurrentLog(log);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setCurrentLog(null);
  };
  
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const columns = [
    { field: '_id', headerName: 'ID Лога', width: 200 },
    {
      field: 'type',
      headerName: 'Тип',
      width: 150,
      renderCell: (params) => {
        const typeInfo = notificationTypes.find(t => t.value === params.value);
        return <Chip label={typeInfo?.label || params.value} size="small" />;
      }
    },
    { field: 'userId', headerName: 'ID Пользователя', width: 200 },
    // { field: 'user', headerName: 'Пользователь', width: 180, valueGetter: (params) => params.row.user?.name || params.row.user?.email || 'N/A' },
    { field: 'title', headerName: 'Заголовок/Тема', width: 200 },
    { field: 'message', headerName: 'Сообщение (кратко)', flex: 1, minWidth: 250, valueGetter: (params) => (params.value || '').substring(0, 100) + '...'},
    {
      field: 'status',
      headerName: 'Статус',
      width: 130,
      renderCell: (params) => {
        const statusInfo = notificationStatuses.find(s => s.value === params.value);
        return <Chip label={statusInfo?.label || params.value} size="small" color={params.value === 'delivered' || params.value === 'sent' ? 'success' : params.value === 'failed' ? 'error' : 'default'} />;
      }
    },
    { field: 'createdAt', headerName: 'Дата', width: 160, type: 'dateTime', valueGetter: (params) => params.value ? new Date(params.value) : null, renderCell: (params) => params.value ? params.value.toLocaleString('ru-RU') : '' },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Просмотреть детали">
          <IconButton onClick={() => handleOpenViewDialog(params.row)} size="small">
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Логи Уведомлений
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth variant="outlined" label="Поиск (заголовок, сообщение)" value={searchTerm} onChange={handleSearchChange} InputProps={{ endAdornment: searchTerm && <InputAdornment position="end"><IconButton onClick={() => setSearchTerm('')} edge="end"><ClearIcon /></IconButton></InputAdornment>}}/>
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
                <TextField fullWidth variant="outlined" label="ID Пользователя" value={filterUserId} onChange={handleUserIdChange} InputProps={{ endAdornment: filterUserId && <InputAdornment position="end"><IconButton onClick={() => setFilterUserId('')} edge="end"><ClearIcon /></IconButton></InputAdornment>}}/>
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel>Тип уведомления</InputLabel>
                    <Select value={filterType} onChange={handleTypeChange} label="Тип уведомления">
                        <MenuItem value=""><em>Все типы</em></MenuItem>
                        {notificationTypes.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel>Статус</InputLabel>
                    <Select value={filterStatus} onChange={handleStatusChange} label="Статус">
                        <MenuItem value=""><em>Все статусы</em></MenuItem>
                        {notificationStatuses.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={2} container spacing={1} alignItems="stretch">
                <Grid item xs={6}>
                    <Button fullWidth variant="contained" onClick={handleSearchSubmit} sx={{height: '100%'}}>Поиск</Button>
                </Grid>
                 <Grid item xs={6}>
                    <Button fullWidth variant="outlined" onClick={handleClearFilters} sx={{height: '100%'}}>Сброс</Button>
                </Grid>
            </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={logs}
          columns={columns}
          loading={loading}
          pagination
          page={page}
          pageSize={pageSize}
          rowCount={totalRows}
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 15, 25, 50, 100]}
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} fullWidth maxWidth="md">
        <DialogTitle>Детали Уведомления</DialogTitle>
        <DialogContent>
          {currentLog ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom><strong>ID Лога:</strong> {currentLog._id}</Typography>
              <Typography variant="subtitle1" gutterBottom><strong>Дата:</strong> {new Date(currentLog.createdAt).toLocaleString('ru-RU')}</Typography>
              <Typography variant="subtitle1" gutterBottom><strong>Пользователь ID:</strong> {currentLog.userId}</Typography>
              {/* <Typography variant="subtitle1" gutterBottom><strong>Пользователь:</strong> {currentLog.user?.name || currentLog.user?.email || 'N/A'}</Typography> */}
              <Typography variant="subtitle1" gutterBottom><strong>Тип:</strong> {notificationTypes.find(t=>t.value === currentLog.type)?.label || currentLog.type}</Typography>
              <Typography variant="subtitle1" gutterBottom><strong>Статус:</strong> {notificationStatuses.find(s=>s.value === currentLog.status)?.label || currentLog.status}</Typography>
              <Typography variant="subtitle1" gutterBottom><strong>Заголовок:</strong> {currentLog.title}</Typography>
              <Typography variant="subtitle1" gutterBottom><strong>Сообщение:</strong></Typography>
              <Paper variant="outlined" sx={{p:1, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 0.5, mb:1}}>{currentLog.message}</Paper>
              {currentLog.data && (
                <>
                  <Typography variant="subtitle1" gutterBottom><strong>Доп. данные (JSON):</strong></Typography>
                  <Paper variant="outlined" sx={{p:1, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 0.5}}>{JSON.stringify(currentLog.data, null, 2)}</Paper>
                </>
              )}
               {currentLog.error && (
                <>
                  <Typography variant="subtitle1" color="error" gutterBottom sx={{mt:1}}><strong>Ошибка:</strong></Typography>
                  <Paper variant="outlined" color="error" sx={{p:1, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 0.5, borderColor: 'error.main'}}>{currentLog.error}</Paper>
                </>
              )}
            </Box>
          ) : <CircularProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminNotificationLogsPage; 