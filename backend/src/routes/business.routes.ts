// src/routes/business.routes.ts
// Express API routing for CRM Operations: Organizations, contacts, projects, contracts, and timelines.

import { Router, Request, Response, NextFunction } from 'express';
import { businessService } from '../services/business.service';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';

const router = Router();

// Secure admin routes
router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

const wrap = (fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ─── 1. Organizations ────────────────────────────────────────────────────────
router.get('/organizations', wrap(async (_req, res) => {
  const list = await businessService.getOrganizations();
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/organizations', wrap(async (req, res) => {
  const item = await businessService.createOrganization(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/organizations/:id', wrap(async (req, res) => {
  const item = await businessService.updateOrganization(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ─── 2. Clients / Contacts ───────────────────────────────────────────────────
router.get('/clients', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await businessService.getClients({ search: q.search, organizationId: q.organizationId });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/clients', wrap(async (req, res) => {
  const item = await businessService.createClient(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

// Lead Conversion Trigger
router.post('/leads/:id/convert', wrap(async (req, res) => {
  const result = await businessService.convertLeadToClient(req.params.id, req.body);
  res.status(201).json({ success: true, data: result } satisfies ApiResponse);
}));

// ─── 3. Consultations ────────────────────────────────────────────────────────
router.get('/consultations', wrap(async (_req, res) => {
  const list = await businessService.getConsultations();
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/consultations', wrap(async (req, res) => {
  const item = await businessService.createConsultation(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

// ─── 4. Projects & Progress Updates ──────────────────────────────────────────
router.get('/projects', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await businessService.getProjects({ search: q.search, organizationId: q.organizationId });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.patch('/projects/:id/progress', wrap(async (req, res) => {
  const { progressPercent, content } = req.body;
  const username = (req as any).user?.email || 'admin';
  const item = await businessService.updateProjectProgress(req.params.id, +progressPercent, content, username);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ─── 5. Contracts ────────────────────────────────────────────────────────────
router.get('/contracts', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await businessService.getContracts({ organizationId: q.organizationId });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/contracts', wrap(async (req, res) => {
  const item = await businessService.createContract(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

// ─── 6. Shared Documents ─────────────────────────────────────────────────────
router.get('/documents', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await businessService.getSharedDocuments({ organizationId: q.organizationId, clientId: q.clientId });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/documents', wrap(async (req, res) => {
  const item = await businessService.shareDocument(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

// ─── 7. Global Activity Timeline & Unified Contact Timeline ─────────────────
router.get('/timeline', wrap(async (_req, res) => {
  const list = await businessService.getTimeline();
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.get('/timeline/unified', wrap(async (req, res) => {
  const email = (req.query.email as string) || '';
  const { activityTimelineService } = await import('../services/activity-timeline.service');
  const list = await activityTimelineService.getUnifiedTimeline(email);
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

// Announcements broadcast CRUD
router.get('/announcements', wrap(async (_req, res) => {
  const list = await (await import('../config/database')).default.announcement.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/announcements', wrap(async (req, res) => {
  const { title, content, isActive } = req.body;
  const item = await (await import('../config/database')).default.announcement.create({
    data: { title, content, isActive: isActive ?? true }
  });
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

// retrieve portal threads
router.get('/messages', wrap(async (_req, res) => {
  const list = await (await import('../config/database')).default.portalMessage.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: { include: { organization: true } } }
  });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/messages', wrap(async (req, res) => {
  const { clientId, content } = req.body;
  const item = await (await import('../config/database')).default.portalMessage.create({
    data: {
      clientId,
      isAdmin: true,
      senderName: 'Denis Chamkaga',
      content
    }
  });
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

export default router;
