# Deployment

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Deployment Architecture

```
┌───────────────────────────────────────────────────────┐
│                    VPS / Cloud Server                   │
│                                                        │
│  ┌──────────┐    ┌──────────────────────────────────┐ │
│  │  NGINX   │───▶│  Docker Compose                   │ │
│  │  :80/443 │    │                                   │ │
│  │          │    │  ┌─────────┐  ┌────────────────┐ │ │
│  │  SSL/TLS │    │  │Frontend │  │    Backend      │ │ │
│  │  Reverse │    │  │ (Static)│  │  (Express API)  │ │ │
│  │  Proxy   │    │  │  :3000  │  │     :5000       │ │ │
│  │          │    │  └─────────┘  └────────┬───────┘ │ │
│  └──────────┘    │                        │         │ │
│                  │  ┌─────────────────────▼───────┐ │ │
│                  │  │      PostgreSQL :5432        │ │ │
│                  │  └─────────────────────────────┘ │ │
│                  │  ┌─────────────────────────────┐ │ │
│                  │  │      Ollama :11434           │ │ │
│                  │  └─────────────────────────────┘ │ │
│                  └──────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

---

## 2. Docker Configuration

### Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| frontend | Custom (Node + Vite build) | 3000 | Serve static React build |
| backend | Custom (Node + Express) | 5000 | API server |
| postgres | postgres:16-alpine | 5432 | Database |
| ollama | ollama/ollama | 11434 | Local LLM runtime |
| nginx | nginx:alpine | 80, 443 | Reverse proxy + SSL |

### Dockerfiles

#### Frontend Dockerfile

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

#### Backend Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Docker Compose Structure

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: denis_platform
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/denis_platform
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
      OLLAMA_URL: http://ollama:11434
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"

  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"

  nginx:
    image: nginx:alpine
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl

volumes:
  postgres_data:
  ollama_data:
```

---

## 3. NGINX Configuration

```nginx
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:5000;
}

server {
    listen 80;
    server_name denischamkaga.com www.denischamkaga.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name denischamkaga.com www.denischamkaga.com;

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Upload size limit
    location /api/v1/media/ {
        client_max_body_size 10M;
        proxy_pass http://backend;
    }

    # Frontend (SPA)
    location / {
        proxy_pass http://frontend;
        try_files $uri $uri/ /index.html;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;
}
```

---

## 4. CI/CD Pipeline (GitHub Actions)

### Workflow: Deploy on Push to Main

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install & Test Frontend
        working-directory: ./frontend
        run: |
          npm ci
          npm run lint
          npm run build
      - name: Install & Test Backend
        working-directory: ./backend
        run: |
          npm ci
          npm run lint
          npm run build
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/denis-platform
            git pull origin main
            docker compose build
            docker compose up -d
            docker compose exec backend npx prisma migrate deploy
```

---

## 5. Environment Variables

### Backend `.env`

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/denis_platform

# JWT
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=https://denischamkaga.com

# AI
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@denischamkaga.com

# Admin
ADMIN_EMAIL=admin@denischamkaga.com
ADMIN_INITIAL_PASSWORD=change-me-on-first-login

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend `.env`

```env
VITE_API_URL=https://denischamkaga.com/api/v1
VITE_APP_NAME=Denis Chamkaga
VITE_DEFAULT_LANGUAGE=en
```

---

## 6. Backup Strategy

| Component | Method | Frequency | Retention |
|-----------|--------|-----------|-----------|
| PostgreSQL | pg_dump to encrypted S3 | Daily | 30 days |
| Uploaded Media | rsync to backup server | Daily | 30 days |
| Environment Files | Encrypted in password manager | On change | Permanent |
| Docker Volumes | Volume backup script | Weekly | 4 weeks |

---

## 7. Monitoring

| Tool | Purpose |
|------|---------|
| Docker health checks | Container liveness |
| NGINX access logs | Traffic monitoring |
| Application logs (Winston) | Error tracking |
| PostgreSQL logs | Query performance |
| Uptime monitoring | External ping service |

---

## 8. Domain & SSL

| Property | Value |
|----------|-------|
| Domain | denischamkaga.com (to be configured) |
| SSL | Let's Encrypt via Certbot (auto-renewal) |
| DNS | A record pointing to server IP |
| WWW | CNAME or redirect to apex domain |
