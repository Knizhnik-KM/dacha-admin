import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Grid,
  Alert,
  Autocomplete,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import API_CONFIG from '../config/api.config';

const AdminTreatmentsPage = () => {
  // Состояния для данных
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Состояния для пагинации и фильтрации
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Состояния для модального окна
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [formData, setFormData] = useState({
    disease_name: '',
    product_name: '',
    product_image: '',
    disease_description: '',
    dosage: '',
    purchase_link: '',
    is_active: true
  });
  
  // Данные для dropdown'ов
  const [diseases, setDiseases] = useState([]);
  const [products, setProducts] = useState([]);
  const [dosages, setDosages] = useState([]);
  
  // Состояния для уведомлений
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  // Загрузка данных
  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(diseaseFilter && { disease_filter: diseaseFilter }),
        ...(productFilter && { product_filter: productFilter }),
        ...(activeFilter !== '' && { active_filter: activeFilter })
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/treatments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTreatments(data.data);
        setTotalCount(data.pagination.total);
      } else {
        setAlert({ show: true, message: data.message || 'Ошибка загрузки данных', severity: 'error' });
      }
    } catch (error) {
      setAlert({ show: true, message: 'Ошибка подключения к серверу', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Загрузка dropdown данных
  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [diseasesRes, productsRes, dosagesRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/admin/treatments/diseases`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/admin/treatments/products`, { headers }),
        fetch(`${API_CONFIG.BASE_URL}/admin/treatments/dosages`, { headers })
      ]);

      const [diseasesData, productsData, dosagesData] = await Promise.all([
        diseasesRes.json(),
        productsRes.json(),
        dosagesRes.json()
      ]);

      if (diseasesData.success) setDiseases(diseasesData.data);
      if (productsData.success) setProducts(productsData.data);
      if (dosagesData.success) setDosages(dosagesData.data);
    } catch (error) {
      console.error('Ошибка загрузки dropdown данных:', error);
    }
  };

  useEffect(() => {
    fetchTreatments();
    fetchDropdownData();
  }, [page, search, diseaseFilter, productFilter, activeFilter]);

  // Обработчики для модального окна
  const handleOpenDialog = (treatment = null) => {
    if (treatment) {
      setEditingTreatment(treatment);
      setFormData(treatment);
    } else {
      setEditingTreatment(null);
      setFormData({
        disease_name: '',
        product_name: '',
        product_image: '',
        disease_description: '',
        dosage: '',
        purchase_link: '',
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTreatment(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Сохранение препарата
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingTreatment 
        ? `${API_CONFIG.BASE_URL}/admin/treatments/${editingTreatment.id}`
        : `${API_CONFIG.BASE_URL}/admin/treatments`;
      
      const method = editingTreatment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlert({ 
          show: true, 
          message: editingTreatment ? 'Препарат обновлен' : 'Препарат создан', 
          severity: 'success' 
        });
        handleCloseDialog();
        fetchTreatments();
        fetchDropdownData(); // Обновляем dropdown данные
      } else {
        setAlert({ show: true, message: data.message || 'Ошибка сохранения', severity: 'error' });
      }
    } catch (error) {
      setAlert({ show: true, message: 'Ошибка подключения к серверу', severity: 'error' });
    }
  };

  // Удаление препарата
  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот препарат?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/treatments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlert({ show: true, message: 'Препарат удален', severity: 'success' });
        fetchTreatments();
      } else {
        setAlert({ show: true, message: data.message || 'Ошибка удаления', severity: 'error' });
      }
    } catch (error) {
      setAlert({ show: true, message: 'Ошибка подключения к серверу', severity: 'error' });
    }
  };

  // Очистка фильтров
  const handleClearFilters = () => {
    setSearch('');
    setDiseaseFilter('');
    setProductFilter('');
    setActiveFilter('');
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Управление препаратами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить препарат
        </Button>
      </Box>

      {/* Уведомления */}
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Поиск"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Autocomplete
                size="small"
                options={diseases}
                value={diseaseFilter}
                onChange={(event, newValue) => setDiseaseFilter(newValue || '')}
                renderInput={(params) => <TextField {...params} label="Болезнь" />}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Autocomplete
                size="small"
                options={products}
                value={productFilter}
                onChange={(event, newValue) => setProductFilter(newValue || '')}
                renderInput={(params) => <TextField {...params} label="Препарат" />}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={activeFilter}
                  label="Статус"
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="true">Активные</MenuItem>
                  <MenuItem value="false">Неактивные</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Очистить
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица препаратов */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Болезнь</TableCell>
                <TableCell>Препарат</TableCell>
                <TableCell>Дозировка</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : treatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Препараты не найдены
                  </TableCell>
                </TableRow>
              ) : (
                treatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell>{treatment.disease_name}</TableCell>
                    <TableCell>{treatment.product_name}</TableCell>
                    <TableCell>{treatment.dosage || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={treatment.is_active ? 'Активный' : 'Неактивный'}
                        color={treatment.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(treatment.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(treatment)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(treatment.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Пагинация */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Модальное окно для создания/редактирования */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTreatment ? 'Редактировать препарат' : 'Добавить препарат'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={diseases}
                value={formData.disease_name}
                onChange={(event, newValue) => handleFormChange('disease_name', newValue || '')}
                onInputChange={(event, newInputValue) => handleFormChange('disease_name', newInputValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Название болезни *" fullWidth />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={products}
                value={formData.product_name}
                onChange={(event, newValue) => handleFormChange('product_name', newValue || '')}
                onInputChange={(event, newInputValue) => handleFormChange('product_name', newInputValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Название препарата *" fullWidth />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL изображения препарата"
                value={formData.product_image}
                onChange={(e) => handleFormChange('product_image', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание болезни"
                value={formData.disease_description}
                onChange={(e) => handleFormChange('disease_description', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={dosages}
                value={formData.dosage}
                onChange={(event, newValue) => handleFormChange('dosage', newValue || '')}
                onInputChange={(event, newInputValue) => handleFormChange('dosage', newInputValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Дозировка" fullWidth />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ссылка на покупку"
                value={formData.purchase_link}
                onChange={(e) => handleFormChange('purchase_link', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => handleFormChange('is_active', e.target.checked)}
                  />
                }
                label="Активный препарат"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.disease_name || !formData.product_name}
          >
            {editingTreatment ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTreatmentsPage; 