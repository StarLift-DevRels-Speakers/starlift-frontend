# syntax=docker/dockerfile:1

# ---------- Build: type-check and bundle the SPA ----------
# Vite 8 needs Node 20.19+ / 22.12+; the official image already ships Yarn 1.
FROM node:22-alpine AS build
WORKDIR /app

# Dependencies first, so the layer is cached until the lockfile changes.
COPY package.json yarn.lock ./
RUN --mount=type=cache,id=starlift-yarn,target=/usr/local/share/.cache/yarn,sharing=locked \
    yarn install --frozen-lockfile --non-interactive --production=false \
    --cache-folder /usr/local/share/.cache/yarn --network-timeout 600000

# Keep nginx-only changes from invalidating the application build.
COPY index.html tsconfig*.json vite.config.ts ./
COPY src ./src
COPY public ./public
RUN yarn build

# ---------- Serve: static files behind nginx ----------
FROM nginx:stable-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1/ || exit 1
