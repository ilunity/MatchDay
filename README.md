# MatchDay

Сервис для согласования даты встречи: создайте мероприятие, поделитесь ссылкой, участники отмечают удобные дни.

## Стек

- Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui
- MongoDB + Mongoose
- Auth.js v5 (magic link через SMTP)
- MinIO (обложки мероприятий)
- Docker Compose + CapRover

## Быстрый старт (локально)

```bash
cp .env.example .env
# Заполните NEXTAUTH_SECRET, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, SMTP_*

docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Откройте http://localhost:3000

## Разработка без Docker

```bash
npm install
cp .env.example .env
# MONGODB_URI=mongodb://localhost:27017/matchday
npm run dev
```

Требуются локальные MongoDB, MinIO и SMTP.

## Деплой

См. [DEPLOY.md](./DEPLOY.md) — инструкция для CapRover.

## Структура

```
app/           — страницы и API routes
components/    — UI-компоненты
lib/           — auth, db, minio, i18n
models/        — Mongoose-модели
actions/       — Server Actions
docker/        — Dockerfile, minio-init
```
