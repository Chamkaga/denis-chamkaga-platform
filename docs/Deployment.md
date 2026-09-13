# Denis Chamkaga Platform – Production Deployment & Operations Guide

## 1. Docker Compose Deployment (Recommended)

To start the full production stack (Backend API, Frontend Nginx Web Server, PostgreSQL 15, Redis 7):

```bash
# Build and launch all services in detached mode
docker-compose up -d --build

# Verify container health
docker-compose ps
```

---

## 2. Nginx & Reverse Proxy Architecture

The production Nginx proxy handles SSL termination, Gzip compression, rate limiting, and static file caching:

```nginx
server {
    listen 80;
    server_name denischamkaga.com www.denischamkaga.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name denischamkaga.com www.denischamkaga.com;

    ssl_certificate /etc/letsencrypt/live/denischamkaga.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/denischamkaga.com/privkey.pem;

    # Frontend Single Page App
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend Express API Proxy
    location /api/ {
        proxy_pass http://backend:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3. Operations Scripts & Maintenance

- **Automated Backup**: `bash scripts/backup.sh` (Generates compressed `pg_dump` backup in `./backups/`)
- **Automated Restore**: `bash scripts/restore.sh ./backups/db_backup.sql.gz`
- **Zero-Downtime Deploy**: `bash scripts/deploy.sh`
- **PM2 Service Manager**: `pm2 start ecosystem.config.js`
