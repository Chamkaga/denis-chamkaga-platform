// backend/src/routes/project-workspace.routes.ts
// Express REST API routes for Phase 2 Advanced Project Workspace

import { Router, Request, Response, NextFunction } from 'express';
import { projectWorkspaceService } from '../services/project-workspace.service';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

const wrap = (fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// Service Templates
router.get('/templates', wrap(async (_req, res) => {
  const templates = await projectWorkspaceService.getTemplates();
  res.json({ success: true, data: templates } satisfies ApiResponse);
}));

// Instant Quote-to-Project Creation
router.post('/create-from-quote', wrap(async (req, res) => {
  const { quotationId, templateName } = req.body;
  const workspace = await projectWorkspaceService.createProjectFromQuotation(quotationId, templateName);
  res.status(201).json({ success: true, data: workspace } satisfies ApiResponse);
}));

// Complete Workspace Details
router.get('/workspace/:projectId', wrap(async (req, res) => {
  const details = await projectWorkspaceService.getWorkspaceDetails(req.params.projectId);
  res.json({ success: true, data: details } satisfies ApiResponse);
}));

// Task Management & Status Update
router.patch('/tasks/:id/status', wrap(async (req, res) => {
  const { status, actualHours } = req.body;
  const task = await projectWorkspaceService.updateTaskStatus(req.params.id, status, actualHours);
  res.json({ success: true, data: task } satisfies ApiResponse);
}));

// Time Tracking Log
router.post('/tasks/:id/time', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const { hours, description } = req.body;
  const log = await projectWorkspaceService.logTime(req.params.id, username, +hours, description);
  res.status(201).json({ success: true, data: log } satisfies ApiResponse);
}));

// DAM File Asset Upload
router.post('/files', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const file = await projectWorkspaceService.uploadAssetFile({ ...req.body, uploadedBy: username });
  res.status(201).json({ success: true, data: file } satisfies ApiResponse);
}));

// AI Project Assistant RAG Summary
router.get('/workspace/:projectId/ai-summary', wrap(async (req, res) => {
  const summary = await projectWorkspaceService.generateAIProjectSummary(req.params.projectId);
  res.json({ success: true, data: summary } satisfies ApiResponse);
}));

export default router;
