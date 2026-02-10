import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Отладочная информация
console.log('Запуск приложения...');
console.log('ADMIN_URL:', process.env.ADMIN_URL);
console.log('PUBLIC_URL:', process.env.PUBLIC_URL);
console.log('REACT_APP_PUBLIC_URL:', process.env.REACT_APP_PUBLIC_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.ADMIN_URL || process.env.PUBLIC_URL || '/mobileapp'}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);