import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import { 
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ShoppingBag as ShoppingBagIcon,
  Store as StoreIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import apiService from '../services/api';

const AdminUsefulInfoPage = () => {
  const [usefulInfo, setUsefulInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItemToDelete, setCurrentItemToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', imageUrl: '', link: '' });

  // Состояние для редактирования
  const [editData, setEditData] = useState({
    title: '',
    mainItems: [],
    sideItems: []
  });

  const fetchUsefulInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.admin.usefulInfo.get();
      if (response.data.success) {
        const data = response.data.data;
        setUsefulInfo(data);
        setEditData({
          title: data.title || 'Полезная информация',
          mainItems: data.mainItems || [],
          sideItems: data.sideItems || []
        });
      } else {
        setSnackbar({ open: true, message: 'Не удалось загрузить данные', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка загрузки полезной информации:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при загрузке', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsefulInfo();
  }, [fetchUsefulInfo]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiService.admin.usefulInfo.update(editData);
      if (response.data.success) {
        setUsefulInfo(response.data.data);
        setEditMode(false);
        setSnackbar({ open: true, message: 'Данные сохранены', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Не удалось сохранить данные', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при сохранении', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: usefulInfo?.title || 'Полезная информация',
      mainItems: usefulInfo?.mainItems || [],
      sideItems: usefulInfo?.sideItems || []
    });
    setEditMode(false);
  };

  const handleAddMainItem = async () => {
    if (!newItem.title || !newItem.imageUrl || !newItem.link) {
      setSnackbar({ open: true, message: 'Заполните все поля', severity: 'error' });
      return;
    }

    try {
      const response = await apiService.admin.usefulInfo.addMainItem(newItem);
      if (response.data.success) {
        fetchUsefulInfo();
        setAddDialogOpen(false);
        setNewItem({ title: '', imageUrl: '', link: '' });
        setSnackbar({ open: true, message: 'Элемент добавлен', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Не удалось добавить элемент', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка добавления элемента:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при добавлении', severity: 'error' });
    }
  };

  const handleDeleteMainItem = async () => {
    if (!currentItemToDelete) return;

    try {
      const response = await apiService.admin.usefulInfo.deleteMainItem(currentItemToDelete._id);
      if (response.data.success) {
        fetchUsefulInfo();
        setSnackbar({ open: true, message: 'Элемент удален', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Не удалось удалить элемент', severity: 'error' });
      }
    } catch (error) {
      console.error('Ошибка удаления элемента:', error);
      setSnackbar({ open: true, message: 'Произошла ошибка при удалении', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setCurrentItemToDelete(null);
  };

  // Компонент градиентного аватара для Wildberries
  const WildberriesAvatar = ({ size = 60 }) => (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6F01FB 0%, #FF49D7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: size * 0.45
      }}
    >
      WB
    </Box>
  );

  const getSideItemIcon = (type, size = 60) => {
    switch (type) {
      case 'wildberries':
        return <WildberriesAvatar size={size} />;
      case 'yandex_market':
        return (
          <Box
            component="img"
            src={`${process.env.REACT_APP_API_URL || 'http://89.110.92.227:3002'}/uploads/poleznayainfa/yamarket.png`}
            sx={{
              width: size,
              height: size,
              borderRadius: '50%',
              objectFit: 'cover'
            }}
            alt="Яндекс.Маркет"
          />
        );
      default:
        return <LinkIcon />;
    }
  };

  const getSideItemLabel = (type) => {
    switch (type) {
      case 'wildberries':
        return 'Wildberries';
      case 'yandex_market':
        return 'Яндекс.Маркет';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          Управление полезной информацией
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {editMode ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                Сохранить
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
              >
                Отмена
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEditMode(true)}
              startIcon={<EditIcon />}
            >
              Редактировать
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Заголовок блока */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Заголовок блока
            </Typography>
            <TextField
              fullWidth
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              disabled={!editMode}
              variant={editMode ? "outlined" : "filled"}
            />
          </Paper>
        </Grid>

        {/* Превью как в мобильном приложении */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Превью (как в мобильном приложении)
            </Typography>
            
            <Box sx={{ 
              bgcolor: '#C8E6C9', 
              borderRadius: 2, 
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                {editData.title}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {/* Основные элементы */}
                {editData.mainItems.filter(item => item.isActive !== false).slice(0, 3).map((item, index) => (
                  <Card 
                    key={index}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.05)' },
                      transition: 'transform 0.2s'
                    }}
                    onClick={() => item.link && window.open(item.link, '_blank')}
                  >
                    <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box
                        component="img"
                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `${process.env.REACT_APP_API_URL || 'http://89.110.92.227:3002'}${item.imageUrl}`}
                        sx={{
                          width: '100%',
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                        alt={item.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', fontSize: '0.7rem' }}>
                        {item.title}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Боковые элементы */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                  {editData.sideItems.filter(item => item.isActive !== false).map((item, index) => (
                    <Tooltip key={index} title={`Перейти на ${getSideItemLabel(item.type)}`}>
                      <Box
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { transform: 'scale(1.1)' },
                          transition: 'transform 0.2s'
                        }}
                        onClick={() => item.link && window.open(item.link, '_blank')}
                      >
                        {getSideItemIcon(item.type, 50)}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Основные элементы */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Основные элементы (максимум 3)
              </Typography>
              {editMode && editData.mainItems.length < 3 && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddDialogOpen(true)}
                >
                  Добавить
                </Button>
              )}
            </Box>
            
            <Grid container spacing={2}>
              {editData.mainItems.map((item, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card>
                    <CardContent>
                      {/* Превью изображения */}
                      {item.imageUrl && (
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                          <Box
                            component="img"
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `${process.env.REACT_APP_API_URL || 'http://89.110.92.227:3002'}${item.imageUrl}`}
                            sx={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '2px solid #e0e0e0'
                            }}
                            alt={item.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {item.link && (
                            <IconButton
                              size="small"
                              onClick={() => window.open(item.link, '_blank')}
                              sx={{ ml: 1 }}
                            >
                              <LaunchIcon />
                            </IconButton>
                          )}
                        </Box>
                      )}
                      
                      <TextField
                        fullWidth
                        label="Заголовок"
                        value={item.title}
                        onChange={(e) => {
                          const updatedMainItems = [...editData.mainItems];
                          updatedMainItems[index] = { ...updatedMainItems[index], title: e.target.value };
                          setEditData({ ...editData, mainItems: updatedMainItems });
                        }}
                        disabled={!editMode}
                        variant={editMode ? "outlined" : "filled"}
                        margin="dense"
                      />
                      <TextField
                        fullWidth
                        label="URL изображения"
                        value={item.imageUrl}
                        onChange={(e) => {
                          const updatedMainItems = [...editData.mainItems];
                          updatedMainItems[index] = { ...updatedMainItems[index], imageUrl: e.target.value };
                          setEditData({ ...editData, mainItems: updatedMainItems });
                        }}
                        disabled={!editMode}
                        variant={editMode ? "outlined" : "filled"}
                        margin="dense"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ImageIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Ссылка"
                        value={item.link}
                        onChange={(e) => {
                          const updatedMainItems = [...editData.mainItems];
                          updatedMainItems[index] = { ...updatedMainItems[index], link: e.target.value };
                          setEditData({ ...editData, mainItems: updatedMainItems });
                        }}
                        disabled={!editMode}
                        variant={editMode ? "outlined" : "filled"}
                        margin="dense"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      {editMode && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={item.isActive !== false}
                              onChange={(e) => {
                                const updatedMainItems = [...editData.mainItems];
                                updatedMainItems[index] = { ...updatedMainItems[index], isActive: e.target.checked };
                                setEditData({ ...editData, mainItems: updatedMainItems });
                              }}
                            />
                          }
                          label="Активен"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Боковые элементы */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Боковые элементы
            </Typography>
            
            <Grid container spacing={2}>
              {editData.sideItems.map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getSideItemIcon(item.type, 60)}
                        <Box sx={{ ml: 2, flex: 1 }}>
                          <Typography variant="h6">
                            {getSideItemLabel(item.type)}
                          </Typography>
                          {item.link && (
                            <IconButton
                              size="small"
                              onClick={() => window.open(item.link, '_blank')}
                              sx={{ mt: 0.5 }}
                            >
                              <LaunchIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      
                      <TextField
                        fullWidth
                        label="Ссылка"
                        value={item.link}
                        onChange={(e) => {
                          const updatedSideItems = [...editData.sideItems];
                          updatedSideItems[index] = { ...updatedSideItems[index], link: e.target.value };
                          setEditData({ ...editData, sideItems: updatedSideItems });
                        }}
                        disabled={!editMode}
                        variant={editMode ? "outlined" : "filled"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      {editMode && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={item.isActive !== false}
                              onChange={(e) => {
                                const updatedSideItems = [...editData.sideItems];
                                updatedSideItems[index] = { ...updatedSideItems[index], isActive: e.target.checked };
                                setEditData({ ...editData, sideItems: updatedSideItems });
                              }}
                            />
                          }
                          label="Активен"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Диалог добавления элемента */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить основной элемент</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Заголовок"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="URL изображения"
            value={newItem.imageUrl}
            onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImageIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Ссылка"
            value={newItem.link}
            onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddMainItem} variant="contained">Добавить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить элемент "{currentItemToDelete?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteMainItem} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Снэкбар */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsefulInfoPage; 