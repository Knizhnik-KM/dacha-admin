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
  DialogContentText
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MenuBook as MenuBookIcon, // или Eco as EcoIcon
  Image as ImageIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import apiService from '../services/api';

const AdminPlantCatalogPage = () => {
  const [catalogPlants, setCatalogPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPlant, setCurrentPlant] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCatalogPlants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.adminPlantCatalog.getCatalogPlants(page + 1, pageSize, searchTerm);
      if (response.data.success) {
        setCatalogPlants(response.data.data.plants.map(p => ({...p, id: p._id })));
        setTotalRows(response.data.data.total);
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось загрузить справочник растений', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка загрузки справочника растений:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при загрузке справочника', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    fetchCatalogPlants();
  }, [fetchCatalogPlants]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(0);
    fetchCatalogPlants();
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
    fetchCatalogPlants();
  };

  const handleOpenEditDialog = (plant) => {
    setIsCreating(false);
    setCurrentPlant(plant);
    setEditedData({ 
      name: plant.name || '',
      description: plant.description || '',
      careRecommendations: plant.careRecommendations || '',
      imageUrl: plant.imageUrl || '',
      // Другие поля, если есть (например, family, origin, light, watering, etc.)
    });
    setEditDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setIsCreating(true);
    setCurrentPlant(null);
    setEditedData({ name: '', description: '', careRecommendations: '', imageUrl: '' });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentPlant(null);
    setIsCreating(false);
  };

  const handleSavePlant = async () => {
    try {
      let response;
      if (isCreating) {
        response = await apiService.adminPlantCatalog.createCatalogPlant(editedData);
      } else if (currentPlant) {
        response = await apiService.adminPlantCatalog.updateCatalogPlant(currentPlant._id, editedData);
      }

      if (response && response.data.success) {
        fetchCatalogPlants();
        setSnackbar({ open: true, message: `Растение успешно ${isCreating ? 'добавлено в справочник' : 'обновлено'}`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: (response && response.data.message) || `Не удалось ${isCreating ? 'добавить' : 'обновить'} растение`, severity: 'error' });
      }
    } catch (error) {
      console.error(`Ошибка ${isCreating ? 'создания' : 'обновления'} растения в справочнике:`, error);
      setSnackbar({ open: true, message: `Произошла ошибка при ${isCreating ? 'создании' : 'обновлении'}`, severity: 'error' });
    }
    handleCloseEditDialog();
  };

  const handleOpenDeleteDialog = (plant) => {
    setCurrentPlant(plant);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentPlant(null);
  };

  const handleDeletePlant = async () => {
    if (!currentPlant) return;
    try {
      const response = await apiService.adminPlantCatalog.deleteCatalogPlant(currentPlant._id);
      if (response.data.success) {
        fetchCatalogPlants();
        setSnackbar({ open: true, message: 'Растение успешно удалено из справочника', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось удалить растение', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка удаления растения из справочника:', error);
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
      field: 'imageUrl',
      headerName: 'Фото',
      width: 80,
      renderCell: (params) => params.value ? <Avatar src={params.value} variant="rounded" /> : <ImageIcon />,
      sortable: false, filterable: false
    },
    { field: 'name', headerName: 'Название вида', width: 250 },
    { field: 'description', headerName: 'Краткое описание', width: 350, valueGetter: (params) => (params.row.description || '').substring(0,100) + '...' },
    { field: 'careRecommendations', headerName: 'Рекомендации (кратко)', flex: 1, minWidth: 300, valueGetter: (params) => (params.row.careRecommendations || '').substring(0,100) + '...' },
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
          Управление Справочником Растений
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenCreateDialog}
        >
          Добавить растение
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
          rows={catalogPlants}
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
        <DialogTitle>{isCreating ? 'Добавить новое растение в справочник' : 'Редактировать растение'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Название вида"
                fullWidth
                value={editedData.name || ''}
                onChange={handleEditDataChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Полное описание"
                fullWidth
                multiline
                rows={4}
                value={editedData.description || ''}
                onChange={handleEditDataChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="careRecommendations"
                label="Рекомендации по уходу"
                fullWidth
                multiline
                rows={6}
                value={editedData.careRecommendations || ''}
                onChange={handleEditDataChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="imageUrl"
                label="URL изображения (опционально)"
                fullWidth
                value={editedData.imageUrl || ''}
                onChange={handleEditDataChange}
              />
            </Grid>
            {/* Сюда можно добавить другие поля: family, origin, light, watering, soil, fertilizer, etc. */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Отмена</Button>
          <Button onClick={handleSavePlant} variant="contained">{isCreating ? 'Добавить' : 'Сохранить'}</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */} 
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Подтвердить удаление</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить растение "{currentPlant?.name}" из справочника?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeletePlant} color="error" variant="contained">Удалить</Button>
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

export default AdminPlantCatalogPage; 