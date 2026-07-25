// backend/src/routes/supporters.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { supportersService } from '../services/supporters.service';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';

const router = Router();

// Secure admin routes
router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

const wrap = (fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ─── 1. Supporters Overview Metrics & Tier Breakdown ─────────────────────────
router.get('/overview', wrap(async (_req, res) => {
  const overview = await supportersService.getSupportersOverview();
  res.json({ success: true, data: overview } satisfies ApiResponse);
}));

// ─── 2. Supporters Directory ──────────────────────────────────────────────────
router.get('/', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await supportersService.getSupporters({
    tier: q.tier as any,
    status: q.status,
    search: q.search
  });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

// ─── 3. Manual Record Contribution / Sync ────────────────────────────────────
router.post('/record', wrap(async (req, res) => {
  const result = await supportersService.recordContribution(req.body);
  res.status(201).json({ success: true, data: result } satisfies ApiResponse);
}));

// ─── 4. Collaborators Overview & Directory ───────────────────────────────────
router.get('/collaborators/overview', wrap(async (_req, res) => {
  const data = await supportersService.getCollaboratorsOverview();
  res.json({ success: true, data } satisfies ApiResponse);
}));

router.get('/collaborators', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await supportersService.getCollaborators(q.search);
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/collaborators', wrap(async (req, res) => {
  const item = await supportersService.upsertCollaborator(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

export default router;
