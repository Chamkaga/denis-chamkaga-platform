# Multi-stage production Dockerfile for Backend API
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace definitions
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci

# Copy source files
COPY shared ./shared
COPY backend ./backend

# Build shared library and backend code
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend

# Production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend ./backend

WORKDIR /app/backend

EXPOSE 5000

USER node

CMD ["node", "dist/server.js"]
