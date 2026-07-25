import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Rate limit: 10 authentication attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (rate-limited)
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Protected routes
router.get('/me', requireAuth, authController.getProfile);
router.get('/profile', requireAuth, authController.getProfile);
router.post('/change-password', requireAuth, authController.changePassword);

export default router;
