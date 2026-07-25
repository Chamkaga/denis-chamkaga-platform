import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { damService } from '../services/dam.service';
import { storageProvider } from '../services/storage/storage.adapter';
import { ApiResponse } from '../types/api';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

// Helper for wrap
const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ── GET /assets ─────────────────────────────────────────────────────────────
router.get('/assets', wrap(async (req, res) => {
  const q = req.query;
  const result = await damService.getAssets({
    folder: q.folder ? String(q.folder) : undefined,
    search: q.search ? String(q.search) : undefined,
    page: q.page ? +q.page : 1,
    limit: q.limit ? +q.limit : 20,
    includeArchived: q.includeArchived === 'true',
  });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

// ── GET /assets/analytics ────────────────────────────────────────────────────
router.get('/assets/analytics', wrap(async (req, res) => {
  const stats = await damService.getDamAnalytics();
  res.json({ success: true, data: stats } satisfies ApiResponse);
}));

// ── GET /assets/:id/usage ────────────────────────────────────────────────────
router.get('/assets/:id/usage', wrap(async (req, res) => {
  const usages = await damService.checkAssetUsage(req.params.id as string);
  res.json({ success: true, data: usages } satisfies ApiResponse);
}));

// ── POST /assets/upload ──────────────────────────────────────────────────────
router.post(
  '/assets/upload',
  upload.single('file'),
  wrap(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
      return;
    }

    const folder = (req.body.folder || 'Images') as string;
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    // Strict validation
    const allowedImages = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'ico'];
    const allowedDocs = ['pdf', 'docx', 'xlsx', 'pptx', 'zip'];
    const allowedVideos = ['mp4', 'webm', 'ogg', 'mov'];
    const allowedAudio = ['mp3', 'wav', 'mpeg'];
    const allAllowed = [...allowedImages, ...allowedDocs, ...allowedVideos, ...allowedAudio];

    if (!allAllowed.includes(ext)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: `Extension .${ext} is not supported.` } });
      return;
    }

    // Process file through storage provider
    const storageResult = await storageProvider.uploadFile(req.file, folder);

    const asset = await damService.registerAsset({
      name: storageResult.name,
      originalName: req.file.originalname,
      path: storageResult.path,
      url: storageResult.url,
      mimeType: req.file.mimetype,
      extension: storageResult.extension,
      folder,
      sizeBytes: req.file.size,
      checksum: storageResult.checksum,
      uploadedBy: (req as any).user?.username || 'admin',
    });

    res.status(201).json({ success: true, data: asset } satisfies ApiResponse);
  })
);

// ── POST /assets/import-url ──────────────────────────────────────────────────
router.post('/assets/import-url', wrap(async (req, res) => {
  const { fileUrl, folder } = req.body as { fileUrl: string; folder: string };
  if (!fileUrl) {
    res.status(400).json({ success: false, error: { code: 'NO_URL', message: 'External file URL required' } });
    return;
  }

  const filename = path.basename(fileUrl) || 'imported_file';
  const ext = path.extname(filename).toLowerCase().replace('.', '') || 'png';
  const uploadsTmpDir = path.resolve(process.cwd(), 'uploads', 'tmp');
  fs.mkdirSync(uploadsTmpDir, { recursive: true });
  const destPath = path.resolve(uploadsTmpDir, `${Date.now()}_${filename}`);

  // Download logic using Node native https/http client
  const client = fileUrl.startsWith('https') ? https : http;
  
  await new Promise<void>((resolve, reject) => {
    client.get(fileUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: status ${response.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });

  const stats = fs.statSync(destPath);

  // Wrap downloaded file as mock Express Multer File
  const mockFile = {
    path: destPath,
    originalname: filename,
    mimetype: `image/${ext === 'svg' ? 'svg+xml' : ext}`,
    size: stats.size,
    filename: path.basename(destPath)
  } as Express.Multer.File;

  // Process via storage provider
  const storageResult = await storageProvider.uploadFile(mockFile, folder || 'Images');

  const asset = await damService.registerAsset({
    name: storageResult.name,
    originalName: filename,
    path: storageResult.path,
    url: storageResult.url,
    mimeType: mockFile.mimetype,
    extension: storageResult.extension,
    folder: folder || 'Images',
    sizeBytes: stats.size,
    checksum: storageResult.checksum,
    uploadedBy: (req as any).user?.username || 'admin',
  });

  res.status(201).json({ success: true, data: asset } satisfies ApiResponse);
}));

// ── PUT /assets/:id/replace ──────────────────────────────────────────────────
router.put(
  '/assets/:id/replace',
  upload.single('file'),
  wrap(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Replacement file required' } });
      return;
    }
    const asset = await damService.replaceAssetFile(req.params.id as string, req.file);
    res.json({ success: true, data: asset } satisfies ApiResponse);
  })
);

// ── PUT /assets/:id ──────────────────────────────────────────────────────────
router.put('/assets/:id', wrap(async (req, res) => {
  const { name, tags } = req.body;
  let asset = await prisma.digitalAsset.findUniqueOrThrow({ where: { id: req.params.id as string } });
  if (name) {
    asset = await damService.renameAsset(req.params.id as string, name);
  }
  if (tags) {
    asset = await damService.updateAssetTags(req.params.id as string, tags);
  }
  res.json({ success: true, data: asset } satisfies ApiResponse);
}));

// ── DELETE /assets/:id/archive ───────────────────────────────────────────────
router.delete('/assets/:id/archive', wrap(async (req, res) => {
  const asset = await damService.archiveAsset(req.params.id as string);
  res.json({ success: true, data: asset } satisfies ApiResponse);
}));

// ── POST /assets/:id/restore ─────────────────────────────────────────────────
router.post('/assets/:id/restore', wrap(async (req, res) => {
  const { folder } = req.body;
  const asset = await damService.restoreAsset(req.params.id as string, folder);
  res.json({ success: true, data: asset } satisfies ApiResponse);
}));

// ── DELETE /assets/:id/permanent ─────────────────────────────────────────────
router.delete('/assets/:id/permanent', wrap(async (req, res) => {
  const force = req.query.force === 'true';
  const asset = await damService.deleteAssetPermanently(req.params.id as string, force);
  res.json({ success: true, data: asset } satisfies ApiResponse);
}));

export default router;
