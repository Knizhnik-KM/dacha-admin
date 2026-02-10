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
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Avatar,
  Container,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  EmojiEvents as EmojiEventsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import apiService from '../services/api';
import API_CONFIG from '../config/api.config';

const AdminAchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    console.log('[AdminAchievements] fetchAchievements: start', { page, pageSize, searchTerm });
    try {
      const response = await apiService.adminAchievements.getAchievements(page + 1, pageSize, searchTerm);
      console.log('[AdminAchievements] fetchAchievements: response', response);
      if (response.data.success) {
        console.log('[AdminAchievements] fetchAchievements: data', response.data.data);
        setAchievements(response.data.data.achievements.map(a => ({...a, id: a._id })));
        setTotalRows(response.data.data.total);
      } else {
        console.error('[AdminAchievements] fetchAchievements: API error', response.data);
        setSnackbar({ open: true, message: response.data.message || 'Не удалось загрузить достижения', severity: 'error' });
      }
    } catch (error) {
      console.error('[AdminAchievements] fetchAchievements: catch error', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при загрузке достижений', severity: 'error' });
    } finally {
      setLoading(false);
      console.log('[AdminAchievements] fetchAchievements: end');
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(0);
    fetchAchievements();
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
    fetchAchievements();
  };

  const handleOpenEditDialog = (achievement) => {
    setIsCreating(false);
    setCurrentAchievement(achievement);
    setEditedData({ 
      name: achievement.name || '',
      description: achievement.description || '',
      iconUrl: achievement.iconUrl || '',
      criteria: achievement.criteria || '',
      points: achievement.points || 10,
      isActive: achievement.isActive !== undefined ? achievement.isActive : true,
      isAutomatic: achievement.isAutomatic || false,
      achievementType: achievement.achievementType || 'manual'
    });
    setEditDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setIsCreating(true);
    setCurrentAchievement(null);
    setEditedData({ 
      name: '', 
      description: '', 
      iconUrl: '', 
      criteria: '',
      points: 10,
      isActive: true,
      isAutomatic: false,
      achievementType: 'manual'
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentAchievement(null);
    setIsCreating(false);
  };

  const handleSaveAchievement = async () => {
    try {
      let response;
      if (isCreating) {
        response = await apiService.adminAchievements.createAchievement(editedData);
      } else if (currentAchievement) {
        response = await apiService.adminAchievements.updateAchievement(currentAchievement._id, editedData);
      }

      if (response && response.data.success) {
        fetchAchievements();
        setSnackbar({ open: true, message: `Достижение успешно ${isCreating ? 'создано' : 'обновлено'}`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: (response && response.data.message) || `Не удалось ${isCreating ? 'создать' : 'обновить'} достижение`, severity: 'error' });
      }
    } catch (error) {
      console.error(`Ошибка ${isCreating ? 'создания' : 'обновления'} достижения:`, error);
      setSnackbar({ open: true, message: `Произошла ошибка при ${isCreating ? 'создании' : 'обновлении'}`, severity: 'error' });
    }
    handleCloseEditDialog();
  };

  const handleOpenDeleteDialog = (achievement) => {
    setCurrentAchievement(achievement);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentAchievement(null);
  };

  const handleDeleteAchievement = async () => {
    if (!currentAchievement) return;
    try {
      const response = await apiService.adminAchievements.deleteAchievement(currentAchievement._id);
      if (response.data.success) {
        fetchAchievements();
        setSnackbar({ open: true, message: 'Достижение успешно удалено', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось удалить достижение', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка удаления достижения:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при удалении', severity: 'error' });
    }
    handleCloseDeleteDialog();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleEditDataChange = (event) => {
    const { name, value } = event.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    {
      field: 'iconUrl',
      headerName: 'Иконка',
      width: 80,
      renderCell: (params) => {
        const iconUrl = params.value ? API_CONFIG.IMAGES_BASE_URL + params.value : null;
        return iconUrl ? <Avatar src={iconUrl} variant="rounded" /> : <EmojiEventsIcon />;
      },
      sortable: false, filterable: false
    },
    { field: 'name', headerName: 'Название', width: 200 },
    { field: 'description', headerName: 'Описание', flex: 1, minWidth: 200 },
    { 
      field: 'points', 
      headerName: 'Баллы', 
      width: 100, 
      type: 'number'
    },
    {
      field: 'isActive',
      headerName: 'Статус',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircleIcon /> : <CancelIcon />}
          label={params.value ? 'Активно' : 'Неактивно'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'achievementType',
      headerName: 'Тип',
      width: 130,
      valueGetter: (params) => {
        const typeLabels = {
          'manual': 'Ручной',
          'first_scan': 'Первое сканирование',
          'scan_count_5': '5 сканирований',
          'scan_count_10': '10 сканирований',
          'scan_count_25': '25 сканирований',
          'scan_count_50': '50 сканирований',
          'scan_count_100': '100 сканирований',
          'first_reminder': 'Первое напоминание',
          'reminder_count_5': '5 напоминаний',
          'reminder_count_10': '10 напоминаний',
          'daily_login_7': '7 дней входа',
          'daily_login_30': '30 дней входа',
          'plant_expert': 'Эксперт растений',
          'garden_guru': 'Гуру сада'
        };
        return typeLabels[params.value] || params.value || 'Ручной';
      }
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Редактировать">
            <IconButton onClick={() => handleOpenEditDialog(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton onClick={() => handleOpenDeleteDialog(params.row)} size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Управление Достижениями
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenCreateDialog}
        >
          Создать достижение
        </Button>
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField 
          fullWidth
          variant="outlined"
          placeholder="Поиск по названию, описанию..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <Paper sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={achievements}
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
          checkboxSelection
          disableSelectionOnClick
        />
      </Paper>

      {/* Диалог создания/редактирования */} 
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
        <DialogTitle>{isCreating ? 'Создать новое достижение' : 'Редактировать достижение'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Название достижения"
                fullWidth
                value={editedData.name || ''}
                onChange={handleEditDataChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Описание"
                fullWidth
                multiline
                rows={4}
                value={editedData.description || ''}
                onChange={handleEditDataChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="iconUrl"
                label="URL иконки (опционально)"
                fullWidth
                value={editedData.iconUrl || ''}
                onChange={handleEditDataChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="criteria" label="Критерии получения" fullWidth value={editedData.criteria || ''} onChange={handleEditDataChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="points" label="Баллы" type="number" fullWidth value={editedData.points || 0} onChange={handleEditDataChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedData.isActive}
                    onChange={(e) => setEditedData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Активно"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="achievement-type-label">Тип достижения</InputLabel>
                <Select
                  labelId="achievement-type-label"
                  id="achievement-type"
                  value={editedData.achievementType || 'manual'}
                  label="Тип достижения"
                  onChange={(e) => setEditedData(prev => ({ ...prev, achievementType: e.target.value }))}
                >
                  <MenuItem value="manual">Ручной</MenuItem>
                  <MenuItem value="first_scan">Первое сканирование</MenuItem>
                  <MenuItem value="scan_count_5">5 сканирований</MenuItem>
                  <MenuItem value="scan_count_10">10 сканирований</MenuItem>
                  <MenuItem value="scan_count_25">25 сканирований</MenuItem>
                  <MenuItem value="scan_count_50">50 сканирований</MenuItem>
                  <MenuItem value="scan_count_100">100 сканирований</MenuItem>
                  <MenuItem value="first_reminder">Первое напоминание</MenuItem>
                  <MenuItem value="reminder_count_5">5 напоминаний</MenuItem>
                  <MenuItem value="reminder_count_10">10 напоминаний</MenuItem>
                  <MenuItem value="daily_login_7">7 дней входа подряд</MenuItem>
                  <MenuItem value="daily_login_30">30 дней входа подряд</MenuItem>
                  <MenuItem value="plant_expert">Эксперт по растениям</MenuItem>
                  <MenuItem value="garden_guru">Гуру сада</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Отмена</Button>
          <Button onClick={handleSaveAchievement} variant="contained">{isCreating ? 'Создать' : 'Сохранить'}</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */} 
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Подтвердить удаление</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить достижение "{currentAchievement?.name}"? 
            Это действие также может удалить его у всех пользователей, которые его получили.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeleteAchievement} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminAchievementsPage; 