import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (serverUrl, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminUser');
    
    if (!token) {
      setError('No authentication token found');
      return;
    }

    let adminUser;
    try {
      adminUser = adminData ? JSON.parse(adminData) : null;
    } catch {
      adminUser = null;
    }

    // Создаем подключение
    const socketInstance = io(serverUrl, {
      auth: {
        token,
        userType: 'admin'
      },
      autoConnect: true,
      ...options
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Обработчики событий
    socketInstance.on('connect', () => {
      console.log('[WebSocket] Подключено к серверу');
      setConnected(true);
      setError(null);
      
      // Присоединяемся к комнате админов
      socketInstance.emit('join_admin_room');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[WebSocket] Отключено от сервера:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[WebSocket] Ошибка подключения:', err);
      setError(err.message);
      setConnected(false);
    });

    socketInstance.on('auth_error', (err) => {
      console.error('[WebSocket] Ошибка аутентификации:', err);
      setError('Authentication failed');
      setConnected(false);
    });

    // Глобальные обработчики для админки
    socketInstance.on('user_online', (data) => {
      console.log('[WebSocket] Пользователь онлайн:', data);
      // Можно добавить глобальное уведомление
    });

    socketInstance.on('user_offline', (data) => {
      console.log('[WebSocket] Пользователь офлайн:', data);
    });

    socketInstance.on('operator_requested', (data) => {
      console.log('[WebSocket] Запрос оператора:', data);
      // Можно показать push-уведомление
      if (Notification.permission === 'granted') {
        new Notification('Новый запрос оператора', {
          body: `Пользователь ${data.userName} запросил помощь`,
          icon: '/favicon.ico'
        });
      }
    });

    socketInstance.on('new_message', (data) => {
      console.log('[WebSocket] Новое сообщение в чате:', data);
    });

    // Cleanup при размонтировании
    return () => {
      console.log('[WebSocket] Закрываем подключение');
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl, options]);

  // Методы для работы с WebSocket
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      
      // Возвращаем функцию для отписки
      return () => {
        socket.off(event, callback);
      };
    }
    return () => {};
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const joinChatRoom = (chatId) => {
    emit('join_chat', { chatId });
  };

  const leaveChatRoom = (chatId) => {
    emit('leave_chat', { chatId });
  };

  const takeChat = (chatId, userId) => {
    emit('take_chat', { chatId, userId });
  };

  const releaseChat = (chatId, userId) => {
    emit('release_chat', { chatId, userId });
  };

  const sendTyping = (chatId, typing = true) => {
    if (typing) {
      emit('typing_start', { chatId });
    } else {
      emit('typing_stop', { chatId });
    }
  };

  return {
    socket,
    connected,
    error,
    emit,
    on,
    off,
    joinChatRoom,
    leaveChatRoom,
    takeChat,
    releaseChat,
    sendTyping
  };
};

export default useSocket; 