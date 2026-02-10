# Dacha Admin Panel

Административная панель для мобильного приложения «Дача без проблем».

## Стек
- React
- MUI
- Socket.IO client
- Nginx (prod)
- Docker (dev)

## Локальный запуск (рекомендуется)

Требуется только Docker, Node на хосте не нужен.

```bash
cp .env.example .env
./run-dev-docker.sh
```
### После запуска:

Admin UI: http://localhost:3000
Backend API: http://localhost:3002/api

### Авторизация

Тестовый доступ:
login: admin
password: admin
