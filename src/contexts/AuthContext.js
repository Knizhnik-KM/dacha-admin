import React, { createContext, useState, useEffect, useContext } from 'react';

// Создаем контекст для аутентификации
const AuthContext = createContext();

// Хук для использования контекста аутентификации
export const useAuth = () => useContext(AuthContext);

// Провайдер аутентификации
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверяем, есть ли сохраненный токен при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = JSON.parse(localStorage.getItem('user'));
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Функция для входа
  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Функция для выхода
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Значения, передаваемые через контекст
  const value = {
    isAuthenticated,
    token,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 