// backend/src/routes/marketing.routes.ts
// Express REST API routes for Phase 3 Enterprise Marketing Automation Platform

import { Router, Request, Response, NextFunction } from 'express';
import { marketingService } from '../services/marketing.service';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

const wrap = (fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// Campaigns API
router.get('/campaigns', wrap(async (_req, res) => {
  const list = await marketingService.getCampaigns();
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/campaigns', wrap(async (req, res) => {
  const campaign = await marketingService.createCampaign(req.body);
  res.status(201).json({ success: true, data: campaign } satisfies ApiResponse);
}));

router.post('/campaigns/:id/dispatch', wrap(async (req, res) => {
  const campaign = await marketingService.dispatchCampaign(req.params.id);
  res.json({ success: true, data: campaign } satisfies ApiResponse);
}));

// Dynamic Audiences Evaluation API
router.get('/audiences/evaluate', wrap(async (req, res) => {
  const ruleName = (req.query.rule as string) || 'HOT_LEADS';
  const audience = await marketingService.evaluateDynamicAudience(ruleName);
  res.json({ success: true, data: audience } satisfies ApiResponse);
}));

// Contact Consent & Preferences API
router.get('/consent/:email', wrap(async (req, res) => {
  const consent = await marketingService.getContactConsent(req.params.email);
  res.json({ success: true, data: consent } satisfies ApiResponse);
}));

router.post('/consent', wrap(async (req, res) => {
  const consent = await marketingService.recordContactConsent(req.body);
  res.status(201).json({ success: true, data: consent } satisfies ApiResponse);
}));

// Customer Journeys API
router.get('/journeys', wrap(async (_req, res) => {
  const journeys = await marketingService.getCustomerJourneys();
  res.json({ success: true, data: journeys } satisfies ApiResponse);
}));

router.post('/journeys', wrap(async (req, res) => {
  const journey = await marketingService.createCustomerJourney(req.body);
  res.status(201).json({ success: true, data: journey } satisfies ApiResponse);
}));

// AI Content Studio (RAG & Brand Voice) API
router.post('/ai-studio/generate', wrap(async (req, res) => {
  const { prompt, brandVoice, topic, channel } = req.body;
  const copy = await marketingService.generateAICopy(prompt, brandVoice, topic, channel);
  res.json({ success: true, data: copy } satisfies ApiResponse);
}));

// Marketing Assets Library API
router.get('/assets', wrap(async (_req, res) => {
  const assets = await marketingService.getMarketingAssets();
  res.json({ success: true, data: assets } satisfies ApiResponse);
}));

router.post('/assets', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const asset = await marketingService.uploadMarketingAsset({ ...req.body, uploadedBy: username });
  res.status(201).json({ success: true, data: asset } satisfies ApiResponse);
}));

// Financial Attribution & Analytics API
router.get('/analytics/attribution', wrap(async (_req, res) => {
  const analytics = await marketingService.getAttributionAnalytics();
  res.json({ success: true, data: analytics } satisfies ApiResponse);
}));

export default router;
