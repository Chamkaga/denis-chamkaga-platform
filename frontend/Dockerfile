# Multi-stage Dockerfile for Frontend Static Web App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/

RUN npm ci

COPY shared ./shared
COPY frontend ./frontend

RUN npm run build --workspace=shared
RUN npm run build --workspace=frontend

FROM nginx:alpine AS runner

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
