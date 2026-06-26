// src/routes/public.routes.ts
// All public read-only API routes — no authentication required.

import { Router, Request, Response, NextFunction } from 'express';
import { publicService } from '../services/public.service';
import { ApiResponse } from '../types/api';

const router = Router();

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } } satisfies ApiResponse);
});

// ── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', wrap(async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query as Record<string, string>;
  const result = await publicService.getProjects({ page: +page || 1, limit: +limit || 12, search, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.get('/projects/featured', wrap(async (_req, res) => {
  const items = await publicService.getFeaturedProjects();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

router.get('/projects/:slug', wrap(async (req, res) => {
  const item = await publicService.getProjectBySlug(req.params.slug);
  if (!item) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }); return; }
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ── Services ─────────────────────────────────────────────────────────────────
router.get('/services', wrap(async (_req, res) => {
  const items = await publicService.getServices();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

router.get('/services/:slug', wrap(async (req, res) => {
  const item = await publicService.getServiceBySlug(req.params.slug);
  if (!item) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } }); return; }
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ── Blog ─────────────────────────────────────────────────────────────────────
router.get('/blog-posts', wrap(async (req, res) => {
  const { page, limit, search, category } = req.query as Record<string, string>;
  const result = await publicService.getBlogPosts({ page: +page || 1, limit: +limit || 9, search, categorySlug: category });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.get('/blog-posts/:slug', wrap(async (req, res) => {
  const item = await publicService.getBlogPostBySlug(req.params.slug);
  if (!item) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } }); return; }
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.get('/categories', wrap(async (_req, res) => {
  const items = await publicService.getCategories();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── Testimonials ─────────────────────────────────────────────────────────────
router.get('/testimonials', wrap(async (req, res) => {
  const featured = req.query.featured === 'true';
  const items = await publicService.getTestimonials(featured);
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── Experience & Education ────────────────────────────────────────────────────
router.get('/experiences', wrap(async (_req, res) => {
  const items = await publicService.getExperiences();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

router.get('/education', wrap(async (_req, res) => {
  const items = await publicService.getEducation();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

router.get('/certificates', wrap(async (_req, res) => {
  const items = await publicService.getCertificates();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── Gallery ───────────────────────────────────────────────────────────────────
router.get('/gallery', wrap(async (req, res) => {
  const { category } = req.query as Record<string, string>;
  const items = await publicService.getGallery(category);
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', wrap(async (_req, res) => {
  const data = await publicService.getPublicSettings();
  res.json({ success: true, data } satisfies ApiResponse);
}));

// ── Contact Form ──────────────────────────────────────────────────────────────
router.post('/contact', wrap(async (req, res) => {
  const { name, email, phone, subject, content } = req.body;
  if (!name || !email || !content) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'name, email and content are required' } });
    return;
  }
  const message = await (await import('../config/database')).default.message.create({
    data: { name, email, phone, subject, content },
  });
  res.status(201).json({ success: true, data: { id: message.id, message: 'Message received. Denis will get back to you soon!' } } satisfies ApiResponse);
}));

export default router;
