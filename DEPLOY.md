# Деплой MatchDay на CapRover

MatchDay разворачивается как Docker Compose приложение через CapRover One-Click App.

## Требования

- VPS с установленным [CapRover](https://caprover.com/)
- Git-репозиторий с кодом MatchDay
- SMTP-сервер для magic link (почта)
- Домен, привязанный к CapRover-приложению

## Структура Docker

| Файл | Назначение |
|------|------------|
| `docker-compose.yml` | Базовый стек: app + MongoDB + MinIO |
| `docker-compose.local.yml` | Override для локальной разработки |
| `captain-definition` | Точка входа CapRover |
| `docker/Dockerfile` | Production-сборка Next.js (standalone) |
| `docker/Dockerfile.dev` | Dev-сборка с hot reload |
| `docker/minio-init.sh` | Создание bucket `matchday-covers` |

## Шаги деплоя

### 1. Создайте приложение в CapRover

1. Откройте CapRover Dashboard
2. **Apps** → **Create New App** → имя, например `matchday`
3. Включите **HTTPS** и привяжите домен (например `matchday.example.com`)

### 2. Подключите Git-репозиторий

1. **Deployment** → **Method 3: Deploy from GitHub/Bitbucket/GitLab**
2. Укажите репозиторий и ветку `main`
3. CapRover обнаружит `captain-definition` и использует `docker-compose.yml`

### 3. Задайте переменные окружения

В CapRover UI → **App Configs** → **Environment Variables** добавьте все переменные из `.env.example`:

```env
NEXTAUTH_URL=https://matchday.example.com
NEXTAUTH_SECRET=<случайная строка 32+ символов>
AUTH_SECRET=<то же значение>
APP_URL=https://matchday.example.com

MONGODB_URI=mongodb://mongodb:27017/matchday

MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=<access key>
MINIO_SECRET_KEY=<secret key>
MINIO_BUCKET=matchday-covers
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=https://matchday.example.com/api/storage

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=<password>
SMTP_FROM=MatchDay <noreply@example.com>
```

> **Важно:** `NEXTAUTH_URL` и `APP_URL` должны совпадать с публичным HTTPS-доменом приложения.

### 4. Persistent volumes

CapRover сохраняет named volumes между деплоями. В `docker-compose.yml` определены:

- `mongodb_data` — данные MongoDB
- `minio_data` — файлы MinIO (обложки)

Не удаляйте эти volumes при обновлении приложения.

### 5. Сеть и порты

- Сервис `app` слушает порт **3000**; на VPS проброшен как `127.0.0.1:3000` для reverse proxy (Caddy/nginx)
- С CapRover порт задаётся через **Container HTTP Port** (3000); при необходимости уберите `ports` у `app`
- `ports` на `0.0.0.0` для локальной разработки — в `docker-compose.local.yml` (перекрывает production)
- MongoDB и MinIO работают во **внутренней** сети `matchday` без публичных портов
- MinIO bucket инициализируется контейнером `minio-init` при первом запуске

### 6. Деплой

После настройки env нажмите **Deploy**. CapRover выполнит:

```bash
docker compose up --build
```

## Локальная разработка

```bash
cp .env.example .env
# Заполните SMTP и MinIO credentials

docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Приложение: http://localhost:3000  
MongoDB: localhost:27017  
MinIO API: http://localhost:9000  
MinIO Console: http://localhost:9001  

## Smoke test после деплоя

1. Откройте домен приложения — landing page
2. **Войти** → введите email → проверьте magic link в почте
3. **Создать мероприятие** → выберите даты → получите ссылку `/e/[slug]`
4. Откройте ссылку в другом браузере → введите имя гостя → отметьте доступность
5. Загрузите обложку (владелец) → проверьте отображение
6. Проверьте блок «Лучшие даты» с агрегацией

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| Magic link не приходит | Проверьте SMTP_* env, логи app-контейнера |
| 500 при загрузке обложки | Проверьте MINIO_* env, что minio-init отработал |
| Redirect loop на login | `NEXTAUTH_URL` должен совпадать с доменом |
| MongoDB connection refused | Дождитесь healthcheck mongodb, проверьте `MONGODB_URI` |
