#!/bin/bash
# Production Database Backup Script for Denis Chamkaga Platform
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/denis_platform_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Starting PostgreSQL backup: ${FILENAME}..."
docker exec -t denis_platform_db pg_dump -U denis denis_platform | gzip > "${FILENAME}"

echo "Backup created successfully: ${FILENAME}"
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +14 -delete
echo "Retention clean-up completed (kept last 14 days)."
