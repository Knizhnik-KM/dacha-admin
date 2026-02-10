import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Skeleton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import apiService from '../services/api';

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Состояние для данных дашборда
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    blockedUsers: 0,
    emailUsers: 0,
    phoneUsers: 0
  });
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Получаем список пользователей
        const response = await apiService.users.getAll(1, 5);
        
        if (response.data.success) {
          const users = response.data.data.users;
          const total = response.data.data.total;
          
          // Рассчитываем статистику
          const blocked = users.filter(user => user.isBlocked).length;
          const email = users.filter(user => user.authMethod === 'email').length;
          const phone = users.filter(user => user.authMethod === 'phone').length;
          
          // Устанавливаем данные
          setStats({
            totalUsers: total,
            newUsers: users.length,
            blockedUsers: blocked,
            emailUsers: email,
            phoneUsers: phone
          });
          
          setRecentUsers(users);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных дашборда:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Компонент статистической карточки
  const StatCard = ({ title, value, icon, color }) => (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'visible' 
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: isMobile ? 1 : 2
        }}>
          <Avatar 
            sx={{ 
              bgcolor: `${color}.light`, 
              color: `${color}.main`,
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              mb: isMobile ? 1 : 0
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ ml: isMobile ? 0 : 2 }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="div" 
              sx={{ fontWeight: 'bold' }}
            >
              {loading ? <Skeleton width={60} /> : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
  
  return (
    <Box>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        gutterBottom 
        sx={{ 
          mb: { xs: 2, sm: 3, md: 4 }, 
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Дашборд
      </Typography>
      
      {/* Статистические карточки */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Всего пользователей" 
            value={stats.totalUsers} 
            icon={<PeopleIcon />} 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Новые пользователи" 
            value={stats.newUsers} 
            icon={<PersonAddIcon />} 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard 
            title="Заблокированные" 
            value={stats.blockedUsers} 
            icon={<BlockIcon />} 
            color="error" 
          />
        </Grid>
      </Grid>
      
      {/* Методы аутентификации */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid item xs={12} sm={6}>
          <StatCard 
            title="Email авторизация" 
            value={stats.emailUsers} 
            icon={<EmailIcon />} 
            color="info" 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard 
            title="SMS авторизация" 
            value={stats.phoneUsers} 
            icon={<PhoneIcon />} 
            color="warning" 
          />
        </Grid>
      </Grid>
      
      {/* Последние пользователи */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Последние пользователи
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          // Скелетон загрузки
          Array.from(new Array(5)).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', my: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
              </Box>
            </Box>
          ))
        ) : (
          // Список пользователей
          <List sx={{ width: '100%', p: 0 }}>
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <ListItem key={user._id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: user.isBlocked ? 'error.main' : 'primary.main' }}>
                      {user.authMethod === 'email' ? <EmailIcon /> : <PhoneIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.email || user.phone}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {user.authMethod === 'email' ? 'Email' : 'Телефон'}
                        </Typography>
                        {' — '}
                        {user.isBlocked ? 'Заблокирован' : 'Активен'}
                        {' • '}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Нет данных о пользователях
              </Typography>
            )}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage; 