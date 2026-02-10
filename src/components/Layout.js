import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Divider, 
  Container, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip,
  useMediaQuery,
  useTheme as useMuiTheme,
  Paper
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon, 
  ExitToApp as LogoutIcon,
  Block as BlockIcon,
  LocalFlorist as LocalFloristIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Memory as MemoryIcon,
  History as HistoryIcon,
  EventNote as EventNoteIcon,
  EmojiEvents as EmojiEventsIcon,
  Chat as ChatIcon,
  StarOutline as StarOutlineIcon,
  MenuBook as MenuBookIcon,
  VerifiedUser as VerifiedUserIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Константы
const DRAWER_WIDTH = 240;
const MOBILE_DRAWER_WIDTH = '80%';

// Элементы меню
const menuItems = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
  { text: 'Пользователи', icon: <PeopleIcon />, path: '/users' },
  { text: 'Растения', icon: <LocalFloristIcon />, path: '/plants' },
  { text: 'История Сканирований', icon: <HistoryIcon />, path: '/admin/scan-history' },
  { text: 'Упр. Напоминаниями', icon: <EventNoteIcon />, path: '/admin/reminders' },
  { text: 'Упр. Препаратами', icon: <LocalPharmacyIcon />, path: '/admin/treatments' },
  { text: 'Упр. Достижениями', icon: <EmojiEventsIcon />, path: '/admin/achievements' },
  { text: 'История Чатов', icon: <ChatIcon />, path: '/admin/chat-history' },
  { text: 'Упр. Избранным', icon: <StarOutlineIcon />, path: '/admin/favorites' },
  { text: 'Справ. Растений', icon: <MenuBookIcon />, path: '/admin/plant-catalog' },
  { text: 'Подлинность Товаров', icon: <VerifiedUserIcon />, path: '/admin/product-codes' },
  { text: 'Логи Уведомлений', icon: <NotificationsIcon />, path: '/admin/notification-logs' },
  { text: 'Полезная информация', icon: <InfoIcon />, path: '/admin/useful-info' },
  { text: 'Нейросеть', icon: <MemoryIcon />, path: '/neuro' },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
  // Состояния
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Закрываем боковую панель при смене маршрута (на мобильных)
  useEffect(() => {
    if (mobileOpen && isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  // Функции-обработчики
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Компонент списка навигации
  const NavList = () => (
    <Box 
      sx={{ 
        height: isMobile ? 'calc(100vh - 204px)' : 'calc(100vh - 140px)', // Для мобильных учитываем AppBar (64px)
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.05)' 
            : 'rgba(255, 255, 255, 0.05)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.2)' 
            : 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.3)' 
            : 'rgba(255, 255, 255, 0.3)',
        }
      }}
    >
      <List component="nav" aria-label="Основная навигация" sx={{ py: 0 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              py: 1.2,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: mode === 'light' 
                  ? 'rgba(63, 81, 181, 0.08)'
                  : 'rgba(255, 255, 255, 0.05)',
              },
              '&:hover': {
                backgroundColor: mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.04)' 
                  : 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path 
                  ? 'primary.main' 
                  : 'inherit',
                minWidth: '40px' 
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: location.pathname === item.path ? 600 : 500,
                fontSize: '0.9rem',
                color: location.pathname === item.path 
                  ? 'primary.main' 
                  : 'inherit',
                lineHeight: 1.2
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  // Содержимое боковой панели
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box 
        sx={{ 
          p: 2, 
          textAlign: 'center', 
          borderBottom: '1px solid',
          borderColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.12)' 
            : 'rgba(255, 255, 255, 0.12)',
          backgroundColor: mode === 'light' 
            ? '#fff' 
            : '#1e1e1e',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold'
          }}
        >
          Админ-панель
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <NavList />
      </Box>
      
      {/* Панель настроек - зафиксирована внизу */}
      <Box 
        sx={{ 
          height: '68px',
          borderTop: '1px solid',
          borderColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.12)' 
            : 'rgba(255, 255, 255, 0.12)',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: mode === 'light' 
            ? '#fff' 
            : '#1e1e1e',
          flexShrink: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
            onClick={handleProfileMenuOpen}
          >
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          <Typography 
            variant="body2" 
            sx={{ 
              ml: 1.5, 
              fontWeight: 500, 
              color: mode === 'light' ? 'text.primary' : '#fff'
            }}
          >
            Админ
          </Typography>
        </Box>
        <Tooltip title={mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
          <IconButton 
            onClick={toggleTheme} 
            size="small" 
            sx={{ color: mode === 'light' ? 'text.primary' : '#fff' }}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
  
  return (
    <>
      {/* Мобильная верхняя панель */}
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          display: { xs: 'block', md: 'none' },
          width: '100%',
          backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
          color: mode === 'light' ? 'text.primary' : '#fff',
          zIndex: 1300,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: isSmallScreen ? '1rem' : '1.25rem' 
            }}
          >
            Мобильное приложение
          </Typography>
          <Tooltip title={mode === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Профиль">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              edge="end"
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem' 
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* Боковое меню - мобильная версия */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: MOBILE_DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
            borderRight: '1px solid',
            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
            backgroundImage: 'none',
            position: 'relative'
          },
          zIndex: 1400
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Основной контейнер */}
      <Box 
        sx={{ 
          display: 'flex',
          width: '100%',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Боковое меню - десктопная версия */}
        <Box
          component="nav"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Paper
            elevation={0}
            square
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: DRAWER_WIDTH,
              backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
              borderRight: '1px solid',
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
              zIndex: 1200,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: mode === 'light' ? '1px 0 5px rgba(0,0,0,0.05)' : 'none',
              backgroundImage: 'none',
              height: '100%'
            }}
          >
            {drawerContent}
          </Paper>
        </Box>

        {/* Основное содержимое */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
            mt: { xs: '56px', md: 0 },
            position: 'relative',
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#121212',
            overflow: 'auto',
            height: '100vh'
          }}
        >
          <Container
            maxWidth={isMobile ? "xl" : "lg"}
            sx={{
              py: { xs: 2, sm: 3, md: 4 },
              px: { xs: 2, sm: 3, md: 4 },
              minHeight: '100%'
            }}
          >
            <Outlet />
          </Container>
        </Box>
      </Box>
      
      {/* Меню профиля */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 2,
          sx: { 
            minWidth: 180,
            mt: 1,
            backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
          }
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Выйти</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Layout;