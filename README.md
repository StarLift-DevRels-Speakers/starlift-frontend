# StarLift — фронтенд

SPA на React. Данные хранятся на бэкенде ([starlift-backend](https://github.com/StarLift-DevRels-Speakers/starlift-backend)),
запросы идут на `/api` того же адреса. Подписки, тестовые покупки и AI-подбор пока остаются демо: они хранятся
в `localStorage` браузера отдельно для каждого пользователя.

```bash
yarn          # установить зависимости
yarn dev      # dev-сервер на http://127.0.0.1:5173
yarn build    # проверка типов и сборка
yarn lint     # ESLint
```

## Запуск вместе с бэкендом

Dev-сервер проксирует `/api` на `http://localhost:8080` — адрес можно сменить переменной `VITE_API_PROXY`:

```bash
# в starlift-backend
docker compose up -d postgres minio minio-init redis
mvn spring-boot:run

# здесь
yarn dev
```

Вход — на `/login`. Регистрация создает аккаунт Спикера; роль DevRel выдает администратор
(`PATCH /api/users/{id}/role`). Пользователи с ролями `DEVREL` и `ADMIN` работают в разделе `/devrel`, остальные — в `/speaker`.

Публичная форма отзыва (`/feedback/<token>`) открывается без входа: ссылку на нее Спикер получает для каждого
выступления на странице «Отзывы».

## Деплой (Docker)

Образ собирает проект в Node и отдает готовую статику через nginx (`deploy/nginx.conf`):

```bash
docker build -t starlift-front .
docker run -d -p 8080:80 --name starlift-front starlift-front   # http://localhost:8080
```

Любой адрес приложения (`/speaker/...`, `/feedback/<token>`) отдает `index.html`, маршрут разбирает react-router.
В продакшене `/api` на тот же домен проксирует nginx бэкенда; если API живет на другом адресе, задайте его при
сборке через `VITE_API_BASE_URL`.
