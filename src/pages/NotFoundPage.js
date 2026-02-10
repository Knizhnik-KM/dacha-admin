import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '6rem', md: '10rem' },
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          404
        </Typography>
        
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mb: 3, fontWeight: 'medium' }}
        >
          Страница не найдена
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 500 }}
        >
          Извините, но страница, которую вы ищете, не существует или была перемещена.
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ py: 1.5, px: 4 }}
        >
          Вернуться на главную
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 