// src/routes/upload.routes.ts
// File upload endpoint — authenticated, admin only.
// Returns the public URL of the uploaded file.

import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { upload, validateUploadedFile } from '../middleware/upload.middleware';
import { ApiResponse } from '../types/api';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

// POST /api/admin/upload
// Body: multipart/form-data with field name "file"
router.post(
  '/upload',
  upload.single('file'),
  validateUploadedFile,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No file was uploaded.' },
        });
        return;
      }

      // Build public URL — e.g. /uploads/2025-06/uuid.jpg
      const relativePath = path
        .relative(process.cwd(), req.file.path)
        .replace(/\\/g, '/');
      const url = `/${relativePath}`;

      res.status(201).json({
        success: true,
        data: {
          url,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
        },
      } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/upload — remove a previously uploaded file
router.delete(
  '/upload',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = req.body as { url: string };
      if (!url) {
        res.status(400).json({ success: false, error: { code: 'NO_URL', message: 'URL required' } });
        return;
      }
      // Prevent path traversal
      const safeRelative = url.replace(/^\/+/, '');
      if (safeRelative.includes('..')) {
        res.status(400).json({ success: false, error: { code: 'INVALID_PATH', message: 'Invalid path' } });
        return;
      }
      const fs = require('fs');
      const fullPath = path.resolve(process.cwd(), safeRelative);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      res.json({ success: true, data: { message: 'File deleted' } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
