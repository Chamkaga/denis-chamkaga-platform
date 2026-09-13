#!/bin/bash
# Production Database Restore Script for Denis Chamkaga Platform
set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore.sh <path_to_backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file $BACKUP_FILE not found!"
  exit 1
fi

echo "Restoring database from ${BACKUP_FILE}..."
gunzip -c "$BACKUP_FILE" | docker exec -i denis_platform_db psql -U denis -d denis_platform

echo "Database restore completed successfully."
