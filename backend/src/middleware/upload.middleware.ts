// src/middleware/upload.middleware.ts
// Multer configuration for local file uploads.
// Storage abstraction: change diskStorage to a cloud adapter (S3, Cloudinary) later.

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { env } from '../config/env';

// ── Storage Engine ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const tempDir = path.join(env.UPLOAD_DIR, 'tmp');
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// ── File Type Filter ────────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/mp3',
  // Documents / Archives
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Accepted extensions: images, videos, audio, PDF, Office docs, zip.`));
  }
};

// ── Multer Instance ─────────────────────────────────────────────────────────────
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // default 10MB
  },
});
