import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  InputAdornment, 
  IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Состояние для формы
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка заполнения полей
    if (!username || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Отправляем запрос на сервер
      const response = await apiService.auth.login({ username, password });
      
      // Если успешно, сохраняем данные и перенаправляем на главную
      if (response.data.success) {
        login(response.data.admin, response.data.token);
        navigate('/');
      }
    } catch (err) {
      console.error('Ошибка входа:', err);
      
      // Обрабатываем ошибки
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Ошибка входа');
      } else {
        setError('Не удалось подключиться к серверу');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              Вход в админ-панель
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Введите ваши учетные данные для доступа к панели управления
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                py: 1.5, 
                mb: 2,
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage; 