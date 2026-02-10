import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailsPage from './pages/UserDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import NeuroPage from './pages/NeuroPage';
import PlantsPage from './pages/PlantsPage';
import AdminScanHistoryPage from './pages/AdminScanHistoryPage';
import AdminRemindersPage from './pages/AdminRemindersPage';
import AdminAchievementsPage from './pages/AdminAchievementsPage';
import AdminChatHistoryPage from './pages/AdminChatHistoryPage';
import AdminFavoritesPage from './pages/AdminFavoritesPage';
import AdminPlantCatalogPage from './pages/AdminPlantCatalogPage';
import AdminProductCodesPage from './pages/AdminProductCodesPage';
import AdminNotificationLogsPage from './pages/AdminNotificationLogsPage';
import AdminUsefulInfoPage from './pages/AdminUsefulInfoPage';
import AdminTreatmentsPage from './pages/AdminTreatmentsPage';

// Отладочная информация
console.log("App.js загружен");

// Защищенный маршрут
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log("ProtectedRoute проверка:", { isAuthenticated, loading });

  // Показываем загрузку, пока проверяем аутентификацию
  if (loading) {
    return <div>Загрузка...</div>;
  }

  // Если не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    console.log("Не аутентифицирован, перенаправление на /login");
    return <Navigate to="/login" replace />;
  }

  // Если аутентифицирован, показываем защищенный контент
  console.log("Аутентифицирован, показываем содержимое");
  return children;
};

function App() {
  useEffect(() => {
    console.log("Маршруты инициализированы");
  }, []);

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<LoginPage />} />

      {/* Защищенные маршруты */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:userId" element={<UserDetailsPage />} />
        <Route path="neuro" element={<NeuroPage />} />
        <Route path="plants" element={<PlantsPage />} />
        <Route path="admin/scan-history" element={<AdminScanHistoryPage />} />
        <Route path="admin/reminders" element={<AdminRemindersPage />} />
        <Route path="admin/achievements" element={<AdminAchievementsPage />} />
        <Route path="admin/chat-history" element={<AdminChatHistoryPage />} />
        <Route path="admin/favorites" element={<AdminFavoritesPage />} />
        <Route path="admin/plant-catalog" element={<AdminPlantCatalogPage />} />
        <Route path="admin/product-codes" element={<AdminProductCodesPage />} />
        <Route path="admin/notification-logs" element={<AdminNotificationLogsPage />} />
        <Route path="admin/useful-info" element={<AdminUsefulInfoPage />} />
        <Route path="admin/treatments" element={<AdminTreatmentsPage />} />
      </Route>

      {/* Маршрут для обработки несуществующих страниц */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App; 