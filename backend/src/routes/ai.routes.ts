// src/routes/ai.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { aiController } from '../controllers/ai.controller';
import { upload, validateUploadedFile } from '../middleware/upload.middleware';
import { damService } from '../services/dam.service';
import { storageProvider } from '../services/storage/storage.adapter';
import { ApiResponse } from '../types/api';
import { requireConversationAccess } from '../middleware/conversation-access.middleware';

const router = Router();

// Rate limit: 30 messages per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  skip: () => process.env.BYPASS_RATE_LIMIT === 'true',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many messages. Please wait a moment.',
    },
  },
});

// File upload rate limit
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many uploads. Please wait a moment.',
    },
  },
});

// Public AI chat endpoints
router.post('/chat', chatLimiter, aiController.chat);
router.post('/chat/stream', chatLimiter, aiController.chat);
router.get('/health', aiController.health);
router.post('/webrtc/session', requireConversationAccess(), aiController.webrtcSession);
router.get('/webrtc/session', aiController.webrtcSessionStatus);
router.post('/webrtc/offer', requireConversationAccess(), aiController.postOffer);
router.get('/webrtc/offer/:sessionId', requireConversationAccess(), aiController.getOffer);
router.post('/webrtc/answer', requireConversationAccess(), (_req, res) => res.status(403).json({ success: false, error: { code: 'ADMIN_REQUIRED', message: 'Only an authenticated administrator may answer calls' } }));
router.get('/webrtc/answer/:sessionId', requireConversationAccess(), aiController.getAnswer);
router.post('/webrtc/candidate', requireConversationAccess(), aiController.postCandidate);
router.get('/webrtc/candidates/:sessionId', requireConversationAccess(), aiController.getCandidates);
router.post('/webrtc/log', requireConversationAccess(), aiController.createCallLog);
router.get('/sessions/:sessionId/history', requireConversationAccess(), aiController.getHistory);
router.get('/sessions/visitor/:visitorId', requireConversationAccess('visitor'), aiController.getVisitorSessions);
router.get('/sessions/:sessionId/download', requireConversationAccess(), aiController.downloadSession);
router.patch('/sessions/:sessionId/rename', requireConversationAccess(), aiController.renameSession);
router.post('/sessions/:sessionId/close', requireConversationAccess(), aiController.closeSession);
router.patch('/sessions/:sessionId/close', requireConversationAccess(), aiController.closeSession);
router.delete('/sessions/:sessionId', requireConversationAccess(), aiController.deleteSession);

// ── Public Chat Attachment Upload (routed via DAM) ────────────────────────────
// Allows public visitors to upload files in chat context (no admin auth required)
router.post(
  '/attachments',
  uploadLimiter,
  upload.single('file'),
  validateUploadedFile,
  requireConversationAccess(),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
        return;
      }

      const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      const allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx', 'xlsx'];

      if (!allowed.includes(ext)) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: `File type .${ext} is not supported for AI chat attachments.` } });
        return;
      }

      const folder = 'AI Chat Attachments';
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
        uploadedBy: `ai_chat:${String(req.body.sessionId)}`,
      });

      res.status(201).json({ success: true, data: asset } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
