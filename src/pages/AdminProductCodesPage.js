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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  VerifiedUser as VerifiedUserIcon,
  FileCopy as FileCopyIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import apiService from '../services/api';

const codeStatuses = [
  { value: 'active', label: 'Активен' },
  { value: 'used', label: 'Использован' },
  { value: 'blocked', label: 'Заблокирован' },
  { value: 'expired', label: 'Просрочен' },
];

const AdminProductCodesPage = () => {
  const [productCodes, setProductCodes] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, used: 0, blocked: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentCode, setCurrentCode] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchProductCodes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.adminProductCodes.getProductCodes(page + 1, pageSize, searchTerm, filterStatus);
      if (response.data.success) {
        setProductCodes(response.data.data.codes.map(c => ({...c, id: c._id })));
        setTotalRows(response.data.data.total);
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось загрузить коды', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка загрузки кодов:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при загрузке кодов', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.adminProductCodes.getProductCodeStats();
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        console.warn('Не удалось загрузить статистику кодов:', response.data.message);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики кодов:', error);
    }
  }, []);

  useEffect(() => {
    fetchProductCodes();
    fetchStats();
  }, [fetchProductCodes, fetchStats]);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleSearchSubmit = () => {
    setPage(0);
    fetchProductCodes();
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilterStatus('');
    setPage(0);
    if (searchTerm === '' && filterStatus === '') {
        fetchProductCodes();
    }
  };

  const handleOpenEditDialog = (code) => {
    setIsCreating(false);
    setCurrentCode(code);
    setEditedData({ 
      code: code.code || '',
      productName: code.productName || '',
      status: code.status || 'active',
      notes: code.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setIsCreating(true);
    setCurrentCode(null);
    setEditedData({ code: '', productName: '', status: 'active', notes: '' });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentCode(null);
    setIsCreating(false);
  };

  const handleSaveCode = async () => {
    if (!editedData.code || !editedData.productName) {
        setSnackbar({ open: true, message: 'Код и Название продукта обязательны', severity: 'warning' });
        return;
    }
    try {
      let response;
      if (isCreating) {
        response = await apiService.adminProductCodes.createProductCode(editedData);
      } else if (currentCode) {
        response = await apiService.adminProductCodes.updateProductCode(currentCode._id, editedData);
      }

      if (response && response.data.success) {
        fetchProductCodes();
        fetchStats();
        setSnackbar({ open: true, message: `Код успешно ${isCreating ? 'создан' : 'обновлен'}`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: (response && response.data.message) || `Не удалось ${isCreating ? 'создать' : 'обновить'} код`, severity: 'error' });
      }
    } catch (error) {
      console.error(`Ошибка ${isCreating ? 'создания' : 'обновления'} кода:`, error);
      setSnackbar({ open: true, message: `Произошла ошибка при ${isCreating ? 'создании' : 'обновлении'}`, severity: 'error' });
    }
    handleCloseEditDialog();
  };

  const handleOpenDeleteDialog = (code) => {
    setCurrentCode(code);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentCode(null);
  };

  const handleDeleteCode = async () => {
    if (!currentCode) return;
    try {
      const response = await apiService.adminProductCodes.deleteProductCode(currentCode._id);
      if (response.data.success) {
        fetchProductCodes();
        fetchStats();
        setSnackbar({ open: true, message: 'Код успешно удален', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось удалить код', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка удаления кода:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при удалении', severity: 'error' });
    }
    handleCloseDeleteDialog();
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  
  const handleEditDataChange = (event) => {
    const { name, value } = event.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 200 },
    { field: 'code', headerName: 'Код', width: 150 },
    { field: 'productName', headerName: 'Название продукта', width: 200 },
    {
      field: 'status',
      headerName: 'Статус',
      width: 120,
      renderCell: (params) => {
        const statusInfo = codeStatuses.find(s => s.value === params.value);
        return <Chip label={statusInfo?.label || params.value} size="small" color={params.value === 'active' ? 'success' : params.value === 'used' ? 'warning' : 'default'} />;
      }
    },
    { field: 'usedBy', headerName: 'Кем использован', width: 180, valueGetter: (params) => params.row.usedBy?.name || params.row.usedBy?.email || '' },
    { field: 'usedAt', headerName: 'Дата использования', width: 160, type: 'dateTime', valueGetter: (params) => params.value ? new Date(params.value) : null, renderCell: (params) => params.value ? params.value.toLocaleString('ru-RU') : '' },
    { field: 'createdAt', headerName: 'Дата добавления', width: 160, type: 'dateTime', valueGetter: (params) => params.value ? new Date(params.value) : null, renderCell: (params) => params.value ? params.value.toLocaleString('ru-RU') : '' },
    { field: 'notes', headerName: 'Заметки', flex: 1, minWidth: 150 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 130,
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Управление Кодами Подлинности</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>Создать код</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid item xs={6} sm={4} md={2.4} key={key}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{value}</Typography>
              <Typography variant="body2" color="textSecondary">{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={7}>
                <TextField 
                fullWidth
                variant="outlined"
                placeholder="Поиск по коду, названию продукта..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    endAdornment: searchTerm ? <InputAdornment position="end"><IconButton onClick={handleClearSearch} edge="end"><ClearIcon /></IconButton></InputAdornment> : null
                }}
                />
            </Grid>
            <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel>Статус</InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={handleFilterStatusChange}
                        label="Статус"
                    >
                        <MenuItem value=""><em>Все</em></MenuItem>
                        {codeStatuses.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
                 <Button fullWidth variant="outlined" onClick={handleSearchSubmit} sx={{height: '56px'}}>
                    Поиск
                 </Button>
            </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={productCodes}
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

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>{isCreating ? 'Создать новый код' : 'Редактировать код'}</DialogTitle>
        <DialogContent sx={{pt: '20px !important'}}>
            <TextField autoFocus margin="dense" name="code" label="Код (уникальный)" type="text" fullWidth variant="outlined" value={editedData.code || ''} onChange={handleEditDataChange} required disabled={!isCreating}/>
            <TextField margin="dense" name="productName" label="Название продукта" type="text" fullWidth variant="outlined" value={editedData.productName || ''} onChange={handleEditDataChange} required/>
            <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel>Статус</InputLabel>
                <Select name="status" value={editedData.status || 'active'} onChange={handleEditDataChange} label="Статус">
                    {codeStatuses.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </Select>
            </FormControl>
            <TextField margin="dense" name="notes" label="Заметки" type="text" fullWidth multiline rows={3} variant="outlined" value={editedData.notes || ''} onChange={handleEditDataChange}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Отмена</Button>
          <Button onClick={handleSaveCode} variant="contained">{isCreating ? 'Создать' : 'Сохранить'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Подтвердить удаление</DialogTitle>
        <DialogContent>
            <Typography>Вы уверены, что хотите удалить код "{currentCode?.code}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeleteCode} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminProductCodesPage; 