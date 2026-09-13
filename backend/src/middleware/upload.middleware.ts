// src/middleware/upload.middleware.ts
// Multer configuration for local file uploads.
// Storage abstraction: change diskStorage to a cloud adapter (S3, Cloudinary) later.

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
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

const DANGEROUS_EXTENSIONS = ['.exe', '.php', '.phtml', '.php3', '.php4', '.php5', '.phps', '.sh', '.bash', '.bat', '.cmd', '.vbs', '.js', '.jar', '.html', '.htm', '.xhtml'];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const originalNameLower = file.originalname.toLowerCase();
  const ext = path.extname(originalNameLower);

  // Check dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return cb(new Error('Executable and script file extensions are strictly prohibited for security reasons.'));
  }

  // Check double extension attack e.g. payload.php.png
  const parts = originalNameLower.split('.');
  if (parts.length > 2) {
    const secondExt = `.${parts[parts.length - 2]}`;
    if (DANGEROUS_EXTENSIONS.includes(secondExt)) {
      return cb(new Error('Double extension attack detected. File upload rejected.'));
    }
  }

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

const signatures: Record<string, (b: Buffer) => boolean> = {
  '.jpg': b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.jpeg': b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.png': b => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  '.gif': b => ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('ascii')),
  '.webp': b => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  '.ico': b => b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0,
  '.pdf': b => b.subarray(0, 5).toString('ascii') === '%PDF-',
  '.docx': b => b[0] === 0x50 && b[1] === 0x4b,
  '.xlsx': b => b[0] === 0x50 && b[1] === 0x4b,
  '.pptx': b => b[0] === 0x50 && b[1] === 0x4b,
  '.zip': b => b[0] === 0x50 && b[1] === 0x4b,
  '.mp4': b => b.subarray(4, 8).toString('ascii') === 'ftyp',
  '.mov': b => b.subarray(4, 8).toString('ascii') === 'ftyp',
  '.webm': b => b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])),
  '.ogg': b => b.subarray(0, 4).toString('ascii') === 'OggS',
  '.wav': b => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WAVE',
  '.mp3': b => b.subarray(0, 3).toString('ascii') === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0),
  '.mpeg': b => b.subarray(0, 3).toString('ascii') === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0),
};

/** Files remain in uploads/tmp (quarantine) until this server-side content check passes. */
export async function assertSafeFileContent(file: Express.Multer.File): Promise<void> {
  const ext = path.extname(file.originalname).toLowerCase();
  const validate = signatures[ext];
  const handle = await fs.promises.open(file.path, 'r');
  const header = Buffer.alloc(16);
  try {
    await handle.read(header, 0, header.length, 0);
  } finally {
    await handle.close();
  }
  if (!validate || !validate(header)) throw new Error('File content does not match its approved extension.');
  if (ext === '.zip' && process.env.MALWARE_SCANNER_ENABLED !== 'true') {
    throw new Error('Archive uploads require the configured malware scanner.');
  }
}

export async function validateUploadedFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.file) return next();
  try {
    await assertSafeFileContent(req.file);
    next();
  } catch (error) {
    if (req.file?.path) await fs.promises.unlink(req.file.path).catch(() => undefined);
    res.status(400).json({ success: false, error: { code: 'UNSAFE_FILE', message: error instanceof Error ? error.message : 'File inspection failed.' } });
  }
}
