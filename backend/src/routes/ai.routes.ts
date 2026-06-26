// src/routes/ai.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { aiController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Rate limit: 30 messages per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many messages. Please wait a moment.',
    },
  },
});

// Public AI chat (visitor-facing)
router.post('/chat', chatLimiter, aiController.chat);
router.get('/health', aiController.health);
router.get('/sessions/:sessionId/history', aiController.getHistory);
router.patch('/sessions/:sessionId/close', aiController.closeSession);

export default router;
