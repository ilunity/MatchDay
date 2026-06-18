# Деплой MatchDay

MatchDay разворачивается на VPS как Docker Compose стек: app + MongoDB + MinIO.

## Требования

- VPS с Docker и Docker Compose
- Git-репозиторий с кодом MatchDay
- SMTP-сервер для magic link (почта)
- Домен с HTTPS (reverse proxy: Caddy, nginx и т.п.)

## Структура Docker

| Файл | Назначение |
|------|------------|
| `docker-compose.yml` | Базовый стек: app + MongoDB + MinIO |
| `docker-compose.local.yml` | Override для локальной разработки |
| `docker/Dockerfile` | Production-сборка Next.js (standalone) |
| `docker/Dockerfile.dev` | Dev-сборка с hot reload |
| `docker/minio-init.sh` | Создание bucket `matchday-covers` |

## Шаги деплоя

### 1. Подготовьте сервер

```bash
ssh user@your-vps
git clone <repo-url> matchday
cd matchday
```

### 2. Задайте переменные окружения

Скопируйте `.env.example` в `.env` на сервере и заполните значения:

```bash
cp .env.example .env
nano .env
```

Пример production-конфига:

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

ADMIN_EMAILS=admin@example.com

SMTP_CONSOLE=false
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=<password>
SMTP_FROM=MatchDay <noreply@example.com>
```

> **Важно:** `NEXTAUTH_URL` и `APP_URL` должны совпадать с публичным HTTPS-доменом приложения.

Флаги **smtpHtml** и **smtpLog** управляются runtime через `/admin/flags` (доступ по `ADMIN_EMAILS`), без редеплоя.

### 3. Запустите стек

```bash
docker compose up -d --build
```

### 4. Настройте reverse proxy

Сервис `app` слушает порт **3000** и проброшен как `127.0.0.1:3000` — проксируйте домен на этот адрес.

MongoDB и MinIO работают во **внутренней** сети `matchday` без публичных портов. MinIO bucket инициализируется контейнером `minio-init` при первом запуске.

### 5. Persistent volumes

В `docker-compose.yml` определены named volumes:

- `mongodb_data` — данные MongoDB
- `minio_data` — файлы MinIO (обложки)

Не удаляйте эти volumes при обновлении приложения.

### 6. Обновление

```bash
git pull
docker compose up -d --build
```

## Логи и отладка на сервере

```bash
# Логи приложения (follow)
docker compose logs -f app

# Логи всего стека
docker compose logs -f

# Войти в контейнер app (образ Alpine — shell: sh)
docker compose exec app sh

# Проверить SMTP-переменные внутри контейнера
docker compose exec app printenv | grep SMTP
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
| Magic link не приходит | Проверьте `SMTP_*` в `.env`; включите флаг **smtpLog** на `/admin/flags` и смотрите `docker compose logs -f app \| grep '\[smtp\]'` |
| SMTP работает локально, но не на VPS | Сравните `printenv \| grep SMTP` в контейнере с локальным `.env`; проверьте исходящий порт 587/465 (`nc -zv smtp.host 587`) |
| 500 при загрузке обложки | Проверьте MINIO_* env, что minio-init отработал |
| Redirect loop на login | `NEXTAUTH_URL` должен совпадать с доменом |
| MongoDB connection refused | Дождитесь healthcheck mongodb, проверьте `MONGODB_URI` |
