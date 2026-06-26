// src/routes/admin.routes.ts
// All admin CRUD routes — require authentication + admin/super_admin role.

import { Router, Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);
router.use(requireRole('admin', 'super_admin'));

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const pq = (q: Record<string, string>) => ({
  page: +q.page || 1,
  limit: +q.limit || 20,
  search: q.search,
  sortBy: q.sortBy,
  sortOrder: q.sortOrder as 'asc' | 'desc',
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', wrap(async (_req, res) => {
  const data = await adminService.getDashboardStats();
  res.json({ success: true, data } satisfies ApiResponse);
}));

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics', wrap(async (req, res) => {
  const days = +(req.query.days as string) || 30;
  const data = await adminService.getAnalytics(days);
  res.json({ success: true, data } satisfies ApiResponse);
}));

// ── Projects ──────────────────────────────────────────────────────────────────
router.get('/projects', wrap(async (req, res) => {
  const result = await adminService.getProjects(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/projects', wrap(async (req, res) => {
  const item = await adminService.createProject(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/projects/:id', wrap(async (req, res) => {
  const item = await adminService.updateProject(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/projects/:id', wrap(async (req, res) => {
  await adminService.deleteProject(req.params.id);
  res.json({ success: true, data: { message: 'Project deleted' } } satisfies ApiResponse);
}));

// ── Services ──────────────────────────────────────────────────────────────────
router.get('/services', wrap(async (req, res) => {
  const result = await adminService.getServices(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/services', wrap(async (req, res) => {
  const item = await adminService.createService(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/services/:id', wrap(async (req, res) => {
  const item = await adminService.updateService(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/services/:id', wrap(async (req, res) => {
  await adminService.deleteService(req.params.id);
  res.json({ success: true, data: { message: 'Service deactivated' } } satisfies ApiResponse);
}));

// ── Blog Posts ────────────────────────────────────────────────────────────────
router.get('/blog-posts', wrap(async (req, res) => {
  const result = await adminService.getBlogPosts(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/blog-posts', wrap(async (req, res) => {
  const item = await adminService.createBlogPost(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/blog-posts/:id', wrap(async (req, res) => {
  const item = await adminService.updateBlogPost(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/blog-posts/:id', wrap(async (req, res) => {
  await adminService.deleteBlogPost(req.params.id);
  res.json({ success: true, data: { message: 'Post deleted' } } satisfies ApiResponse);
}));

// ── Leads ─────────────────────────────────────────────────────────────────────
router.get('/leads', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const result = await adminService.getLeads({ ...pq(q), status: q.status, temperature: q.temperature });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.put('/leads/:id', wrap(async (req, res) => {
  const item = await adminService.updateLead(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ── Messages ──────────────────────────────────────────────────────────────────
router.get('/messages', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const result = await adminService.getMessages({ ...pq(q), unreadOnly: q.unreadOnly === 'true' });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.patch('/messages/:id/read', wrap(async (req, res) => {
  const item = await adminService.markMessageRead(req.params.id);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ── Appointments ──────────────────────────────────────────────────────────────
router.get('/appointments', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const result = await adminService.getAppointments({ ...pq(q), status: q.status });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.put('/appointments/:id', wrap(async (req, res) => {
  const item = await adminService.updateAppointment(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ── Testimonials ──────────────────────────────────────────────────────────────
router.get('/testimonials', wrap(async (req, res) => {
  const result = await adminService.getTestimonials(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/testimonials', wrap(async (req, res) => {
  const item = await adminService.createTestimonial(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/testimonials/:id', wrap(async (req, res) => {
  const item = await adminService.updateTestimonial(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/testimonials/:id', wrap(async (req, res) => {
  await adminService.deleteTestimonial(req.params.id);
  res.json({ success: true, data: { message: 'Testimonial deleted' } } satisfies ApiResponse);
}));

// ── Gallery ───────────────────────────────────────────────────────────────────
router.get('/gallery', wrap(async (req, res) => {
  const result = await adminService.getGallery(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/gallery', wrap(async (req, res) => {
  const item = await adminService.createGalleryItem(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/gallery/:id', wrap(async (req, res) => {
  const item = await adminService.updateGalleryItem(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/gallery/:id', wrap(async (req, res) => {
  await adminService.deleteGalleryItem(req.params.id);
  res.json({ success: true, data: { message: 'Item deleted' } } satisfies ApiResponse);
}));

// ── Site Settings ─────────────────────────────────────────────────────────────
router.get('/settings', wrap(async (req, res) => {
  const { category } = req.query as Record<string, string>;
  const data = await adminService.getSettings(category);
  res.json({ success: true, data } satisfies ApiResponse);
}));

router.put('/settings', wrap(async (req, res) => {
  const updates = req.body as Array<{ key: string; value: string }>;
  const data = await adminService.updateSettings(updates);
  res.json({ success: true, data } satisfies ApiResponse);
}));

router.put('/settings/:key', wrap(async (req, res) => {
  const { value } = req.body;
  const data = await adminService.updateSetting(req.params.key, value);
  res.json({ success: true, data } satisfies ApiResponse);
}));

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', requireRole('super_admin'), wrap(async (req, res) => {
  const result = await adminService.getUsers(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.patch('/users/:id/toggle-active', requireRole('super_admin'), wrap(async (req, res) => {
  const item = await adminService.toggleUserActive(req.params.id);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

export default router;
