# StarLift — фронтенд

Демо работает без сервера: данные хранятся в `localStorage` браузера.

```bash
yarn          # установить зависимости
yarn dev      # dev-сервер на http://127.0.0.1:5173
yarn build    # проверка типов и сборка
yarn lint     # ESLint
```

## Деплой (Docker)

Образ собирает проект в Node и отдает готовую статику через nginx (`deploy/nginx.conf`):

```bash
docker build -t starlift-front .
docker run -d -p 8080:80 --name starlift-front starlift-front   # http://localhost:8080
```

Любой адрес приложения (`/speaker/...`, `/feedback/<token>`) отдает `index.html`, маршрут разбирает react-router.
