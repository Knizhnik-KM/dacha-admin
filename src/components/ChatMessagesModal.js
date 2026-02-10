import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  SupportAgent as SupportAgentIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import apiService from '../services/api';
import { getImageUrl } from '../config/api.config';

const ChatMessagesModal = ({ 
  open, 
  onClose, 
  session, 
  onTakeChat, 
  onReleaseChat,
  currentAdmin 
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open && session) {
      fetchMessages();
    }
  }, [open, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!session) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.adminChatHistory.getChatMessages(
        session._id, // Используем sessionId вместо userId
        1, 
        100 // Загружаем последние 100 сообщений
      );
      
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
      } else {
        setError(response.data.message || 'Ошибка загрузки сообщений');
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      setError('Произошла ошибка при загрузке сообщений');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await apiService.adminChatHistory.sendOperatorMessage({
        userId: session.user._id,
        sessionId: session._id,
        text: newMessage.trim()
      });

      if (response.data.success) {
        // Добавляем сообщение в локальный список
        const operatorMessage = {
          ...response.data.data.message,
          author: 'operator'
        };
        setMessages(prev => [...prev, operatorMessage]);
        setNewMessage('');
      } else {
        setError(response.data.message || 'Ошибка отправки сообщения');
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      setError('Произошла ошибка при отправке сообщения');
    } finally {
      setSending(false);
    }
  };

  const handleTakeChat = async () => {
    if (!session || !onTakeChat) return;
    
    try {
      await onTakeChat(session._id, session.user._id);
      // Обновляем список сообщений
      setTimeout(fetchMessages, 500);
    } catch (error) {
      console.error('Ошибка взятия чата:', error);
      setError('Ошибка взятия чата на себя');
    }
  };

  const handleReleaseChat = async () => {
    if (!session || !onReleaseChat) return;
    
    try {
      await onReleaseChat(session._id, session.user._id);
      // Обновляем список сообщений
      setTimeout(fetchMessages, 500);
    } catch (error) {
      console.error('Ошибка освобождения чата:', error);
      setError('Ошибка возврата чата ИИ');
    }
  };

  const getMessageIcon = (author) => {
    switch (author) {
      case 'user':
        return <PersonIcon />;
      case 'ai':
        return <SmartToyIcon />;
      case 'operator':
        return <SupportAgentIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getMessageColor = (author) => {
    switch (author) {
      case 'user':
        return 'primary';
      case 'ai':
        return 'info';
      case 'operator':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const canSendMessage = session && 
    session.currentHandler && 
    session.currentHandler.type === 'operator' && 
    session.currentHandler.operatorId === currentAdmin?.id;

  const canTakeChat = session && 
    session.currentHandler && 
    session.currentHandler.type === 'ai';

  const canReleaseChat = session && 
    session.currentHandler && 
    session.currentHandler.type === 'operator' && 
    session.currentHandler.operatorId === currentAdmin?.id;

  if (!session) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">
            Чат с {session.user?.name || session.user?.email || 'Пользователь'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip 
              label={session.status || 'active'} 
              size="small" 
              color={session.status === 'active' ? 'success' : session.status === 'with_operator' ? 'warning' : 'default'}
            />
            <Chip 
              label={`${messages.length} сообщений`} 
              size="small" 
              variant="outlined"
            />
            {session.currentHandler && (
              <Chip 
                label={session.currentHandler.type === 'ai' ? 'ИИ' : 'Оператор'} 
                size="small"
                color={session.currentHandler.type === 'ai' ? 'info' : 'success'}
              />
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Управление чатом */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canTakeChat && (
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={handleTakeChat}
              >
                Взять чат
              </Button>
            )}
            {canReleaseChat && (
              <Button 
                variant="outlined" 
                color="secondary" 
                size="small"
                onClick={handleReleaseChat}
              >
                Вернуть ИИ
              </Button>
            )}
          </Box>
        </Box>

        {/* Сообщения */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', maxHeight: '400px' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              Сообщений пока нет
            </Typography>
          ) : (
            <Box>
              {messages.map((message, index) => (
                <Box key={message._id || index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: `${getMessageColor(message.author)}.main` 
                      }}
                    >
                      {getMessageIcon(message.author)}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" color="text.primary">
                          {message.author === 'user' ? (session.user?.name || session.user?.email || 'Пользователь') :
                           message.author === 'ai' ? 'ИИ-помощник' : 'Оператор'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatMessageTime(message.date)}
                        </Typography>
                        {message.metadata?.responseTime && (
                          <Chip 
                            label={`${message.metadata.responseTime}ms`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: message.author === 'user' ? 'grey.50' : 'background.paper',
                          borderColor: `${getMessageColor(message.author)}.main`,
                          borderWidth: 1
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.text}
                        </Typography>
                        
                        {message.image && (
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ImageIcon fontSize="small" />
                              <Typography variant="caption">
                                {message.image.originalName}
                              </Typography>
                              {message.image.url && (
                                <Tooltip title="Просмотреть изображение">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => window.open(getImageUrl(message.image.url), '_blank')}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        )}
                        
                        {message.aiAnalysis && (
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              label="Анализ растения" 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </Box>

        {/* Поле для отправки сообщения */}
        {canSendMessage && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  disabled={!newMessage.trim() || sending}
                  onClick={handleSendMessage}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  {sending ? <CircularProgress size={20} /> : <SendIcon />}
                </Button>
              </Box>
            </Box>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatMessagesModal; 