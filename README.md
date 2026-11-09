# StarLift — фронтенд

SPA на React. Данные хранятся на бэкенде ([starlift-backend](https://github.com/StarLift-DevRels-Speakers/starlift-backend)),
API по умолчанию доступен по адресу `https://startlift.duckdns.org/api`. Подписки, тестовые покупки и AI-подбор пока остаются демо: они хранятся
в `localStorage` браузера отдельно для каждого пользователя.

```bash
yarn          # установить зависимости
yarn dev      # dev-сервер на http://127.0.0.1:5173
yarn build    # проверка типов и сборка
yarn lint     # ESLint
```

## Деморежим для работы над дизайном

Создайте `.env.local` в корне проекта:

```env
VITE_DEMO_MODE=true
```

Запустите `yarn dev` (или `npm run dev`) и откройте `/speaker` либо `/devrel`.
Вход и бэкенд не нужны. Кнопка «Демо: DevRel / Спикер» в шапке переключает роль.
Данные каталогов, профилей, мероприятий, заявок, отзывов и рейтинга подставляются локально;
формы меняют демоданные в браузере. Это сценарии для проверки интерфейса, а не полная имитация проверок бэкенда.

По умолчанию у спикера есть доклады, выступления и отзывы, а у DevRel есть черновик, опубликованные
мероприятия и входящие заявки. Для проверки нового спикера добавьте `VITE_DEMO_SCENARIO=empty`
в `.env.local` и перезапустите Vite.

Для сброса данных удалите в DevTools → Application → Local Storage ключ `starlift-design-demo-v1`
(или `starlift-design-demo-empty-v1` для пустого сценария) и обновите страницу.
Тестовые покупки можно сбросить отдельно в разделе «Подписка и покупки».
Формы отзыва по демоссылкам работают в том же браузере.

Чтобы вернуться к бэкенду, установите `VITE_DEMO_MODE=false` и перезапустите dev-сервер.
В production-сборке деморежим всегда отключён.

## Запуск вместе с бэкендом

Dev-сервер проксирует `/api` на `https://startlift.duckdns.org`. Для работы с локальным бэкендом
задайте переменную окружения `VITE_API_PROXY=http://localhost:8080` перед запуском Vite:

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
В production-сборке браузер обращается к `https://startlift.duckdns.org/api`. Чтобы сменить адрес,
задайте `VITE_API_BASE_URL` при сборке. Для запросов через тот же домен укажите пустое значение
и настройте проксирование `/api` на сервере.
