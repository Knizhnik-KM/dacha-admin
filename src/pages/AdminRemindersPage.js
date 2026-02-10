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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Container,
  DialogContentText,
  Chip,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NotificationsActive as NotificationsActiveIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';
import apiService from '../services/api';

const reminderTypes = [
  { value: 'watering', label: 'Полив' },
  { value: 'spraying', label: 'Орошение' },
  { value: 'fertilizing', label: 'Подкормка' },
  { value: 'transplanting', label: 'Пересадка' },
  { value: 'pruning', label: 'Обрезка' }
];
const timeOfDayOptions = [
  { value: 'morning', label: 'Утром' },
  { value: 'afternoon', label: 'Днем' },
  { value: 'evening', label: 'Вечером' }
];
const activeOptions = [
  { value: '', label: 'Все' },
  { value: 'true', label: 'Активные' },
  { value: 'false', label: 'Неактивные' }
];
const daysOfWeekOptions = [
  { value: 0, label: 'Воскресенье' },
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' }
];

const AdminRemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [stats, setStats] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Отладочная информация
  useEffect(() => {
    console.log('[DEBUG] selectedRows changed:', selectedRows);
  }, [selectedRows]);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    console.log('[AdminReminders] fetchReminders: start', { page, pageSize, searchTerm, typeFilter, timeOfDayFilter, activeFilter });
    try {
      const response = await apiService.adminReminders.getReminders(
        page + 1, 
        pageSize, 
        searchTerm, 
        typeFilter, 
        activeFilter
      );
      console.log('[AdminReminders] fetchReminders: response', response);
      if (response.data.success) {
        console.log('[AdminReminders] fetchReminders: data', response.data.data);
        setReminders(response.data.data.reminders.map(r => ({...r, id: r._id})));
        setTotalRows(response.data.data.total);
      } else {
        console.error('[AdminReminders] fetchReminders: API error', response.data);
        setSnackbar({ open: true, message: response.data.message || 'Не удалось загрузить напоминания', severity: 'error' });
      }
    } catch (error) {
      console.error('[AdminReminders] fetchReminders: catch error', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при загрузке напоминаний', severity: 'error' });
    } finally {
      setLoading(false);
      console.log('[AdminReminders] fetchReminders: end');
    }
  }, [page, pageSize, searchTerm, typeFilter, timeOfDayFilter, activeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.adminReminders.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('[AdminReminders] fetchStats: error', error);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(0);
    fetchReminders();
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setTypeFilter('');
    setTimeOfDayFilter('');
    setActiveFilter('');
    setPage(0);
    fetchReminders();
  };

  const handleFilterChange = (type, value) => {
    if (type === 'type') setTypeFilter(value);
    if (type === 'timeOfDay') setTimeOfDayFilter(value);
    if (type === 'active') setActiveFilter(value);
    setPage(0);
  };

  const handleOpenEditDialog = (reminder) => {
    setCurrentReminder(reminder);
    setEditedData({ 
      type: reminder.type || '',
      timeOfDay: reminder.timeOfDay || 'morning',
      date: reminder.date ? new Date(reminder.date) : null,
      daysOfWeek: reminder.daysOfWeek || [],
      repeatWeekly: reminder.repeatWeekly || false,
      repeat: reminder.repeat || '',
      note: reminder.note || '',
      isActive: reminder.isActive !== undefined ? reminder.isActive : true
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentReminder(null);
  };

  const handleSaveEdit = async () => {
    if (!currentReminder) return;
    try {
      const dataToUpdate = { ...editedData };
      if (dataToUpdate.date) {
        dataToUpdate.date = dataToUpdate.date.toISOString();
      }
      
      const response = await apiService.adminReminders.updateReminder(currentReminder._id, dataToUpdate);
      if (response.data.success) {
        fetchReminders();
        fetchStats();
        setSnackbar({ open: true, message: 'Напоминание успешно обновлено', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось обновить напоминание', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка обновления напоминания:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при обновлении', severity: 'error' });
    }
    handleCloseEditDialog();
  };

  const handleOpenDeleteDialog = (reminder) => {
    setCurrentReminder(reminder);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentReminder(null);
  };

  const handleDeleteReminder = async () => {
    if (!currentReminder) return;
    try {
      const response = await apiService.adminReminders.deleteReminder(currentReminder._id);
      if (response.data.success) {
        fetchReminders();
        fetchStats();
        setSnackbar({ open: true, message: 'Напоминание успешно удалено', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось удалить напоминание', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка удаления напоминания:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при удалении', severity: 'error' });
    }
    handleCloseDeleteDialog();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Функции для массового удаления
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      setSnackbar({ open: true, message: 'Выберите напоминания для удаления', severity: 'warning' });
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleCloseBulkDeleteDialog = () => {
    setBulkDeleteDialogOpen(false);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      const response = await apiService.adminReminders.deleteManyReminders(selectedRows);
      if (response.data.success) {
        fetchReminders();
        fetchStats();
        setSelectedRows([]);
        setSnackbar({ 
          open: true, 
          message: `Успешно удалено ${response.data.deletedCount} напоминаний`, 
          severity: 'success' 
        });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось удалить напоминания', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при массовом удалении', severity: 'error' });
    }
    setBulkDeleteDialogOpen(false);
  };
  
  const handleEditDataChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditedData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDateChange = (newDate) => {
    setEditedData(prev => ({ ...prev, date: newDate }));
  };

  const handleDaysOfWeekChange = (day) => {
    setEditedData(prev => {
      const currentDays = prev.daysOfWeek || [];
      const isSelected = currentDays.includes(day);
      const newDays = isSelected 
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      return { ...prev, daysOfWeek: newDays };
    });
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    {
      field: 'user',
      headerName: 'Пользователь',
      width: 200,
      valueGetter: (params) => {
        const user = params.row.user;
        if (typeof user === 'object' && user !== null) {
          return user.name || user.email || 'N/A';
        }
        return user || 'N/A';
      },
    },
    {
      field: 'plant',
      headerName: 'Растение',
      width: 180,
      valueGetter: (params) => {
        const plant = params.row.plant;
        if (typeof plant === 'object' && plant !== null) {
          return plant.name || 'N/A';
        }
        return plant || 'N/A';
      },
    },
    { 
      field: 'type', 
      headerName: 'Тип', 
      width: 130,
      renderCell: (params) => {
        const typeObj = reminderTypes.find(t => t.value === params.value);
        return (
          <Chip 
            label={typeObj ? typeObj.label : params.value} 
            size="small" 
            variant="outlined"
            color="primary"
          />
        );
      }
    },
    { 
      field: 'timeOfDay', 
      headerName: 'Время дня', 
      width: 120,
      renderCell: (params) => {
        const timeObj = timeOfDayOptions.find(t => t.value === params.value);
        return timeObj ? (
          <Chip 
            label={timeObj.label} 
            size="small" 
            variant="outlined"
            color="secondary"
          />
        ) : '-';
      }
    },
    {
      field: 'date',
      headerName: 'Дата и время',
      width: 180,
      type: 'dateTime',
      valueGetter: (params) => params.row.date ? new Date(params.row.date) : null,
      renderCell: (params) => params.value ? params.value.toLocaleString('ru-RU') : ''
    },
    { 
      field: 'daysOfWeek', 
      headerName: 'Дни недели', 
      width: 150,
      renderCell: (params) => {
        if (!params.value || params.value.length === 0) return '-';
        const dayLabels = params.value.map(day => 
          daysOfWeekOptions.find(d => d.value === day)?.label.substring(0, 2) || day
        );
        return <Chip label={dayLabels.join(', ')} size="small" variant="outlined" />;
      }
    },
    { 
      field: 'repeatWeekly', 
      headerName: 'Еженедельно', 
      width: 120,
      renderCell: (params) => (
        params.value ? 
          <Chip label="Да" size="small" color="success" variant="outlined" /> : 
          <Chip label="Нет" size="small" color="default" variant="outlined" />
      )
    },
    { 
      field: 'note', 
      headerName: 'Заметка', 
      width: 200, 
      valueGetter: (params) => params.row.note || ''
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
      ),
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsActiveIcon fontSize="large" />
          Управление Напоминаниями Пользователей
        </Typography>

        {/* Статистика */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Всего напоминаний
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ backgroundColor: '#e8f5e8' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Активных
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.active}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ backgroundColor: '#fff3e0' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Ближайших (7 дней)
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.upcoming}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ backgroundColor: '#ffebee' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Неактивных
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.inactive}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField 
                fullWidth
                variant="outlined"
                placeholder="Поиск по типу, заметке..."
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
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Тип</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Тип"
                >
                  <MenuItem value="">Все типы</MenuItem>
                  {reminderTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Время дня</InputLabel>
                <Select
                  value={timeOfDayFilter}
                  onChange={(e) => handleFilterChange('timeOfDay', e.target.value)}
                  label="Время дня"
                >
                  <MenuItem value="">Все время</MenuItem>
                  {timeOfDayOptions.map((time) => (
                    <MenuItem key={time.value} value={time.value}>{time.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={activeFilter}
                  onChange={(e) => handleFilterChange('active', e.target.value)}
                  label="Статус"
                >
                  {activeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
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

        {/* Панель действий */}
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: selectedRows.length > 0 ? '#f3e5f5' : 'transparent',
          borderRadius: 2,
          border: selectedRows.length > 0 ? '1px solid #e1bee7' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedRows.length > 0 ? (
              <>
                <Chip 
                  label={`Выбрано: ${selectedRows.length}`} 
                  color="primary" 
                  variant="outlined"
                  icon={<CheckCircleIcon />}
                />
                <Typography variant="body2" color="text.secondary">
                  {selectedRows.length === 1 ? 'напоминание' : 
                   selectedRows.length < 5 ? 'напоминания' : 'напоминаний'}
                </Typography>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Выберите напоминания для массовых действий
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setSelectedRows(reminders.map(r => r.id))}
                  disabled={reminders.length === 0}
                >
                  Выбрать все
                </Button>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedRows.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedRows([])}
                  size="small"
                >
                  Отменить выбор
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  sx={{ 
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                      backgroundColor: '#d32f2f'
                    }
                  }}
                >
                  Удалить выбранные ({selectedRows.length})
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Paper sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={reminders}
            columns={columns}
            loading={loading}
            pagination
            page={page}
            pageSize={pageSize}
            rowCount={totalRows}
            paginationMode="server"
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[10, 20, 50]}
            components={{ 
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar: {
                csvOptions: { fileName: 'напоминания' },
                printOptions: { fileName: 'напоминания' },
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            checkboxSelection
            disableSelectionOnClick
            onRowSelectionModelChange={(newSelection) => {
              console.log('Selection changed (new):', newSelection);
              setSelectedRows(newSelection);
            }}
            onSelectionModelChange={(newSelection) => {
              console.log('Selection changed (old):', newSelection);
              setSelectedRows(newSelection);
            }}
            rowSelectionModel={selectedRows}
            selectionModel={selectedRows}
            localeText={{
              // Русификация DataGrid
              columnMenuLabel: 'Меню столбца',
              columnMenuShowColumns: 'Показать столбцы',
              columnMenuFilter: 'Фильтр',
              columnMenuHideColumn: 'Скрыть',
              columnMenuUnsort: 'Отменить сортировку',
              columnMenuSortAsc: 'Сортировать по возрастанию',
              columnMenuSortDesc: 'Сортировать по убыванию',
              columnsPanelTextFieldLabel: 'Найти столбец',
              columnsPanelTextFieldPlaceholder: 'Название столбца',
              columnsPanelDragIconLabel: 'Изменить порядок столбца',
              columnsPanelShowAllButton: 'Показать все',
              columnsPanelHideAllButton: 'Скрыть все',
              filterPanelAddFilter: 'Добавить фильтр',
              filterPanelDeleteIconLabel: 'Удалить',
              filterPanelOperators: 'Операторы',
              filterPanelOperatorAnd: 'И',
              filterPanelOperatorOr: 'Или',
              filterPanelColumns: 'Столбцы',
              filterPanelInputLabel: 'Значение',
              filterPanelInputPlaceholder: 'Значение фильтра',
              filterOperatorContains: 'содержит',
              filterOperatorEquals: 'равно',
              filterOperatorStartsWith: 'начинается с',
              filterOperatorEndsWith: 'заканчивается',
              filterOperatorIs: 'равно',
              filterOperatorNot: 'не равно',
              filterOperatorAfter: 'после',
              filterOperatorOnOrAfter: 'на или после',
              filterOperatorBefore: 'до',
              filterOperatorOnOrBefore: 'на или до',
              filterOperatorIsEmpty: 'пусто',
              filterOperatorIsNotEmpty: 'не пусто',
              filterValueAny: 'любое',
              filterValueTrue: 'да',
              filterValueFalse: 'нет',
              toolbarDensity: 'Плотность',
              toolbarDensityLabel: 'Плотность',
              toolbarDensityCompact: 'Компактная',
              toolbarDensityStandard: 'Стандартная',
              toolbarDensityComfortable: 'Комфортная',
              toolbarColumns: 'Столбцы',
              toolbarColumnsLabel: 'Выбрать столбцы',
              toolbarFilters: 'Фильтры',
              toolbarFiltersLabel: 'Показать фильтры',
              toolbarFiltersTooltipHide: 'Скрыть фильтры',
              toolbarFiltersTooltipShow: 'Показать фильтры',
              toolbarFiltersTooltipActive: (count) => `${count} активных фильтров`,
              toolbarExport: 'Экспорт',
              toolbarExportLabel: 'Экспорт',
              toolbarExportCSV: 'Скачать как CSV',
              toolbarExportPrint: 'Печать',
              noRowsLabel: 'Нет данных',
              noResultsOverlayLabel: 'Результаты не найдены.',
              footerRowSelected: (count) => `${count} строк выбрано`,
              footerTotalRows: 'Всего строк:',
              footerTotalVisibleRows: (visibleCount, totalCount) =>
                `${visibleCount.toLocaleString()} из ${totalCount.toLocaleString()}`,
              checkboxSelectionHeaderName: 'Выбор строки',
              booleanCellTrueLabel: 'да',
              booleanCellFalseLabel: 'нет',
              actionsCellMore: 'ещё',
              pinToLeft: 'Закрепить слева',
              pinToRight: 'Закрепить справа',
              unpin: 'Открепить',
              treeDataGroupingHeaderName: 'Группа',
              treeDataExpand: 'показать дочерние',
              treeDataCollapse: 'скрыть дочерние',
              groupingColumnHeaderName: 'Группа',
              expandDetailPanel: 'Развернуть',
              collapseDetailPanel: 'Свернуть',
            }}
          />
        </Paper>

        {/* Диалог редактирования */}
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
          <DialogTitle>Редактировать напоминание</DialogTitle>
          <DialogContent>
            {currentReminder && (
              <Grid container spacing={2} sx={{mt: 1}}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="type-label">Тип напоминания</InputLabel>
                    <Select
                      labelId="type-label"
                      name="type"
                      value={editedData.type || ''}
                      onChange={handleEditDataChange}
                      label="Тип напоминания"
                    >
                      {reminderTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="timeOfDay-label">Время дня</InputLabel>
                    <Select
                      labelId="timeOfDay-label"
                      name="timeOfDay"
                      value={editedData.timeOfDay || 'morning'}
                      onChange={handleEditDataChange}
                      label="Время дня"
                    >
                      {timeOfDayOptions.map((time) => (
                        <MenuItem key={time.value} value={time.value}>{time.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Дата и время"
                    value={editedData.date}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth margin="dense" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="active-label">Статус</InputLabel>
                    <Select
                      labelId="active-label"
                      name="isActive"
                      value={editedData.isActive}
                      onChange={handleEditDataChange}
                      label="Статус"
                    >
                      <MenuItem value={true}>Активно</MenuItem>
                      <MenuItem value={false}>Неактивно</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Дни недели для повтора:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {daysOfWeekOptions.map((day) => (
                      <FormControlLabel
                        key={day.value}
                        control={
                          <Checkbox
                            checked={(editedData.daysOfWeek || []).includes(day.value)}
                            onChange={() => handleDaysOfWeekChange(day.value)}
                            size="small"
                          />
                        }
                        label={day.label}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="repeatWeekly"
                        checked={editedData.repeatWeekly || false}
                        onChange={handleEditDataChange}
                      />
                    }
                    label="Еженедельное повторение"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="note"
                    label="Заметка"
                    fullWidth
                    margin="dense"
                    multiline
                    rows={3}
                    value={editedData.note || ''}
                    onChange={handleEditDataChange}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Отмена</Button>
            <Button onClick={handleSaveEdit} variant="contained">Сохранить</Button>
          </DialogActions>
        </Dialog>

        {/* Диалог подтверждения удаления */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Подтвердить удаление</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить это напоминание? Отменить это действие будет невозможно.
              {currentReminder && ` (Тип: ${currentReminder.type}, Дата: ${new Date(currentReminder.date).toLocaleString('ru-RU')})`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
            <Button onClick={handleDeleteReminder} color="error" variant="contained">Удалить</Button>
          </DialogActions>
        </Dialog>

        {/* Диалог подтверждения массового удаления */}
        <Dialog open={bulkDeleteDialogOpen} onClose={handleCloseBulkDeleteDialog}>
          <DialogTitle>Подтвердить массовое удаление</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить {selectedRows.length} выбранных напоминаний? 
              Отменить это действие будет невозможно.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBulkDeleteDialog}>Отмена</Button>
            <Button onClick={handleConfirmBulkDelete} color="error" variant="contained">
              Удалить все ({selectedRows.length})
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminRemindersPage; 