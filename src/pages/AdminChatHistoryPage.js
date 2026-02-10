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
  Container,
  Snackbar,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon,
  SupportAgent as SupportAgentIcon,
  SmartToy as SmartToyIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import apiService from '../services/api';
import ChatMessagesModal from '../components/ChatMessagesModal';

// Пока не будем создавать отдельную страницу для деталей, 
// можно будет добавить позже или отображать в модальном окне.

const AdminChatHistoryPage = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Статистика
  const [stats, setStats] = useState(null);
  
  // Модальные окна
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Уведомления
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Данные текущего админа (можно получить из контекста или localStorage)
  const [currentAdmin] = useState(() => {
    try {
      const adminData = localStorage.getItem('adminUser');
      return adminData ? JSON.parse(adminData) : null;
    } catch {
      return null;
    }
  });

  const fetchChatSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.adminChatHistory.getChatSessions(
        page + 1, 
        pageSize, 
        searchTerm,
        statusFilter
      );
      
      if (response.data.success) {
        setChatSessions(response.data.data.sessions.map(s => ({
          ...s, 
          id: s._id 
        })));
        setTotalRows(response.data.data.total);
      } else {
        setSnackbar({ 
          open: true, 
          message: response.data.message || 'Не удалось загрузить историю чатов', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('[AdminChatHistory] Ошибка загрузки сессий:', error);
      setSnackbar({ 
        open: true, 
        message: 'Произошла ошибка при загрузке истории чатов', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.adminChatHistory.getChatStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('[AdminChatHistory] Ошибка загрузки статистики:', error);
    }
  }, []);

  useEffect(() => {
    fetchChatSessions();
    fetchStats();
  }, [fetchChatSessions, fetchStats]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(0);
    fetchChatSessions();
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPage(0);
  };

  const handleViewChat = (session) => {
    setSelectedSession(session);
    setChatModalOpen(true);
  };

  const handleTakeChat = async (sessionId, userId) => {
    try {
      const response = await apiService.adminChatHistory.takeChat({
        sessionId,
        userId
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Чат взят на себя',
          severity: 'success'
        });
        
        // Обновляем список сессий
        fetchChatSessions();
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Ошибка взятия чата');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Ошибка взятия чата',
        severity: 'error'
      });
      throw error;
    }
  };

  const handleReleaseChat = async (sessionId, userId) => {
    try {
      const response = await apiService.adminChatHistory.releaseChat({
        sessionId,
        userId
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Чат возвращён ИИ',
          severity: 'success'
        });
        
        // Обновляем список сессий
        fetchChatSessions();
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Ошибка возврата чата');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Ошибка возврата чата',
        severity: 'error'
      });
      throw error;
    }
  };

  const handleRefresh = () => {
    fetchChatSessions();
    fetchStats();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'waiting_operator':
        return 'warning';
      case 'with_operator':
        return 'info';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'waiting_operator':
        return 'Ждёт оператора';
      case 'with_operator':
        return 'С оператором';
      case 'closed':
        return 'Закрыт';
      default:
        return status || 'Неизвестно';
    }
  };

  const getHandlerIcon = (handlerType) => {
    return handlerType === 'ai' ? <SmartToyIcon /> : <SupportAgentIcon />;
  };

  const columns = [
    { 
      field: '_id', 
      headerName: 'ID Сессии', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {params.value?.slice(-8) || ''}
        </Typography>
      )
    },
    {
      field: 'user',
      headerName: 'Пользователь',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.row.user?.name || 'Без имени'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.user?.email || params.row.user?.phone || 'Нет контакта'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Статус',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={getStatusLabel(params.value)} 
          size="small" 
          color={getStatusColor(params.value)}
          variant="outlined"
        />
      )
    },
    {
      field: 'currentHandler',
      headerName: 'Обработчик',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getHandlerIcon(params.value?.type)}
          <Typography variant="caption">
            {params.value?.type === 'ai' ? 'ИИ' : 
             params.row.operator?.username || 'Оператор'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'messageCount',
      headerName: 'Сообщений',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value || 0}</Typography>
          <Typography variant="caption" color="text.secondary">
            У:{params.row.userMessageCount || 0} ИИ:{params.row.aiMessageCount || 0} 
            {params.row.operatorMessageCount > 0 && ` О:${params.row.operatorMessageCount}`}
          </Typography>
        </Box>
      )
    },
    {
      field: 'lastActivity',
      headerName: 'Последняя активность',
      width: 160,
      type: 'dateTime',
      valueGetter: (params) => params.row.lastActivity ? new Date(params.row.lastActivity) : null,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value ? params.value.toLocaleDateString('ru-RU') : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value ? params.value.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Просмотреть чат">
            <IconButton 
              onClick={() => handleViewChat(params.row)} 
              size="small"
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          История Чатов Пользователей
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Обновить
        </Button>
      </Box>

      {/* Статистика */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ChatIcon color="primary" />
                  <Box>
                    <Typography variant="h6">{stats.sessions?.totalSessions || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Всего сессий
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyIcon color="info" />
                  <Box>
                    <Typography variant="h6">{stats.sessions?.activeSessions || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Активных (ИИ)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SupportAgentIcon color="warning" />
                  <Box>
                    <Typography variant="h6">{stats.sessions?.waitingOperator + stats.sessions?.withOperator || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      С операторами
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="success" />
                  <Box>
                    <Typography variant="h6">{stats.connections?.connectedUsers || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Онлайн сейчас
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth
              variant="outlined"
              placeholder="Поиск по имени, email, телефону пользователя..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (searchTerm || statusFilter) && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Статус сессии</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Статус сессии"
              >
                <MenuItem value="">Все статусы</MenuItem>
                <MenuItem value="active">Активные</MenuItem>
                <MenuItem value="waiting_operator">Ждут оператора</MenuItem>
                <MenuItem value="with_operator">С оператором</MenuItem>
                <MenuItem value="closed">Закрытые</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearchSubmit}
              startIcon={<SearchIcon />}
            >
              Найти
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица сессий */}
      <Paper sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={chatSessions}
          columns={columns}
          loading={loading}
          pagination
          page={page}
          pageSize={pageSize}
          rowCount={totalRows}
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20, 50]}
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
          getRowHeight={() => 64}
        />
      </Paper>

      {/* Модальное окно чата */}
      <ChatMessagesModal
        open={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        session={selectedSession}
        onTakeChat={handleTakeChat}
        onReleaseChat={handleReleaseChat}
        currentAdmin={currentAdmin}
      />

      {/* Уведомления */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminChatHistoryPage; 