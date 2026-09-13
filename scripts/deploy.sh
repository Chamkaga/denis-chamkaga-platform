#!/bin/bash
# Production Zero-Downtime Deployment Script
set -e

echo "Starting automated production deployment..."

# 1. Pull latest code
git pull origin main

# 2. Build shared packages & backend
npm run build --workspace=shared
npm run build --workspace=backend
npm run build --workspace=frontend

# 3. Apply database migrations
cd backend && npx prisma migrate deploy && cd ..

# 4. Rebuild & restart Docker containers
docker-compose up -d --build --remove-orphans

echo "Deployment completed successfully! Telemetry online."
