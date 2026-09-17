// src/routes/admin.routes.ts
// All admin CRUD routes — require authentication + admin/super_admin role.

import { Router, Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { requireAuth, requireRole, requireMappedResourceAccess } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';
import prisma from '../config/database';
import * as knowledgePipeline from '../ai/services/knowledge-pipeline.service';
import { logger } from '../utils/logger';
import { webrtcSignaling } from '../ai/webrtc-signaling';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);
router.use(requireMappedResourceAccess((routePath) => {
  const root = routePath.split('/').filter(Boolean)[0] || 'dashboard';
  const mapping: Record<string, string> = {
    dashboard: 'analytics', analytics: 'analytics', activity: 'audit_logs', 'audit-logs': 'audit_logs',
    projects: 'projects', services: 'services', 'blog-posts': 'blog_posts', leads: 'leads', messages: 'messages',
    appointments: 'appointments', testimonials: 'testimonials', gallery: 'gallery', settings: 'settings',
    experiences: 'experiences', education: 'education', certificates: 'certificates', languages: 'settings',
    faqs: 'knowledge', tutorials: 'knowledge', assistant: 'ai', 'ai-prompts': 'ai', 'ai-settings': 'ai',
    'ai-knowledge': 'knowledge', 'ai-copilot': 'ai', webrtc: 'calls', content: 'blog_posts',
    newsletter: 'marketing', campaigns: 'marketing', partnerships: 'marketing', 'product-ideas': 'projects',
    'roadmap-items': 'projects', presence: 'settings', users: 'users', backup: 'settings', calendar: 'calendar',
    erp: 'finance', 'visitor-analytics': 'analytics'
  };
  return mapping[root] || root;
}));

// Cache invalidation middleware for knowledge-base mutation routes
import { knowledgeService } from '../ai/services/knowledge.service';
router.use((req, res, next) => {
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (mutatingMethods.includes(req.method)) {
    const originalJson = res.json;
    res.json = function (body) {
      const response = originalJson.call(this, body);
      const mutatingPaths = ['/services', '/projects', '/faqs', '/settings', '/blog-posts', '/experiences', '/education', '/certificates', '/tutorials'];
      if (mutatingPaths.some(path => req.path.startsWith(path))) {
        logger.info(`[Knowledge Cache] Mutating request detected: ${req.method} ${req.path}. Invalidating cache...`);
        knowledgeService.clearCache().catch(err => logger.error('[Knowledge Cache] Failed to clear cache:', err));
      }
      return response;
    };
  }
  next();
});

const wrap = (fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const pq = (q: Record<string, string>) => ({
  page: +q.page || 1,
  limit: +q.limit || 20,
  search: q.search,
  sortBy: q.sortBy,
  sortOrder: q.sortOrder as 'asc' | 'desc',
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', wrap(async (req, res) => {
  const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;
  const data = await adminService.getDashboardStats({
    ...(from && !Number.isNaN(from.getTime()) ? { from } : {}),
    ...(to && !Number.isNaN(to.getTime()) ? { to } : {}),
  });
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

// ── Experiences ───────────────────────────────────────────────────────────────
router.get('/experiences', wrap(async (req, res) => {
  const result = await adminService.getExperiences(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));
router.post('/experiences', wrap(async (req, res) => {
  const item = await adminService.createExperience(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));
router.put('/experiences/:id', wrap(async (req, res) => {
  const item = await adminService.updateExperience(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));
router.delete('/experiences/:id', wrap(async (req, res) => {
  await adminService.deleteExperience(req.params.id);
  res.json({ success: true, data: { message: 'Experience deleted' } } satisfies ApiResponse);
}));

// ── Education ────────────────────────────────────────────────────────────────
router.get('/education', wrap(async (req, res) => {
  const result = await adminService.getEducation(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));
router.post('/education', wrap(async (req, res) => {
  const item = await adminService.createEducation(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));
router.put('/education/:id', wrap(async (req, res) => {
  const item = await adminService.updateEducation(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));
router.delete('/education/:id', wrap(async (req, res) => {
  await adminService.deleteEducation(req.params.id);
  res.json({ success: true, data: { message: 'Education deleted' } } satisfies ApiResponse);
}));

// ── Certificates ──────────────────────────────────────────────────────────────
router.get('/certificates', wrap(async (req, res) => {
  const result = await adminService.getCertificates(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));
router.post('/certificates', wrap(async (req, res) => {
  const item = await adminService.createCertificate(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));
router.put('/certificates/:id', wrap(async (req, res) => {
  const item = await adminService.updateCertificate(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));
router.delete('/certificates/:id', wrap(async (req, res) => {
  await adminService.deleteCertificate(req.params.id);
  res.json({ success: true, data: { message: 'Certificate deleted' } } satisfies ApiResponse);
}));

// ── Languages ────────────────────────────────────────────────────────────────
router.get('/languages', wrap(async (req, res) => {
  const result = await adminService.getLanguages(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));
router.post('/languages', wrap(async (req, res) => {
  const item = await adminService.createLanguage(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));
router.put('/languages/:id', wrap(async (req, res) => {
  const item = await adminService.updateLanguage(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));
router.delete('/languages/:id', wrap(async (req, res) => {
  await adminService.deleteLanguage(req.params.id);
  res.json({ success: true, data: { message: 'Language deleted' } } satisfies ApiResponse);
}));

// ── FAQs ─────────────────────────────────────────────────────────────────────
router.get('/faqs', wrap(async (req, res) => {
  const result = await adminService.getFaqs(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));
router.post('/faqs', wrap(async (req, res) => {
  const item = await adminService.createFaq(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));
router.put('/faqs/:id', wrap(async (req, res) => {
  const item = await adminService.updateFaq(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));
router.delete('/faqs/:id', wrap(async (req, res) => {
  await adminService.deleteFaq(req.params.id);
  res.json({ success: true, data: { message: 'Faq deleted' } } satisfies ApiResponse);
}));

// ── Tutorials ─────────────────────────────────────────────────────────────────
router.get('/tutorials', wrap(async (req, res) => {
  const result = await adminService.getTutorials(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));
router.post('/tutorials', wrap(async (req, res) => {
  const item = await adminService.createTutorial(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));
router.put('/tutorials/:id', wrap(async (req, res) => {
  const item = await adminService.updateTutorial(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));
router.delete('/tutorials/:id', wrap(async (req, res) => {
  await adminService.deleteTutorial(req.params.id);
  res.json({ success: true, data: { message: 'Tutorial deleted' } } satisfies ApiResponse);
}));

// ── AI Assistant Sessions Logs ───────────────────────────────────────────────
router.get('/assistant/sessions', wrap(async (req, res) => {
  const result = await adminService.getChatSessions(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));
router.get('/assistant/sessions/:id', wrap(async (req, res) => {
  const data = await adminService.getChatSessionHistory(req.params.id);
  res.json({ success: true, data } satisfies ApiResponse);
}));

// ── Audit Logs ───────────────────────────────────────────────────────────────
router.get('/audit-logs', wrap(async (req, res) => {
  const result = await adminService.getAuditLogs(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

// ── Backup ───────────────────────────────────────────────────────────────────
router.post('/backup', wrap(async (_req, res) => {
  const backup = await adminService.exportDatabaseBackup();
  res.json({ success: true, data: backup } satisfies ApiResponse);
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

router.post('/users', requireRole('super_admin'), wrap(async (req, res) => {
  const item = await adminService.createUser(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.post('/users/:id/reset-password', requireRole('super_admin'), wrap(async (req, res) => {
  const result = await adminService.resetUserPassword(req.params.id);
  res.json({ success: true, data: result } satisfies ApiResponse);
}));

// ── Leads Extended ────────────────────────────────────────────────────────────
router.post('/leads', wrap(async (req, res) => {
  const item = await adminService.createLead(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/leads/:id', wrap(async (req, res) => {
  await adminService.deleteLead(req.params.id);
  res.json({ success: true, data: { message: 'Lead deleted' } } satisfies ApiResponse);
}));

// ── Messages Extended ──────────────────────────────────────────────────────────
router.delete('/messages/:id', wrap(async (req, res) => {
  await adminService.deleteMessage(req.params.id);
  res.json({ success: true, data: { message: 'Message deleted' } } satisfies ApiResponse);
}));

// ── Scheduled Projects (Calendar) ─────────────────────────────────────────────
router.get('/calendar', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const result = await adminService.getScheduledProjects({
    ...pq(q), status: q.status, from: q.from, to: q.to
  });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/calendar', wrap(async (req, res) => {
  const item = await adminService.createScheduledProject(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/calendar/:id', wrap(async (req, res) => {
  const item = await adminService.updateScheduledProject(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/calendar/:id', wrap(async (req, res) => {
  await adminService.deleteScheduledProject(req.params.id);
  res.json({ success: true, data: { message: 'Scheduled project deleted' } } satisfies ApiResponse);
}));

router.get('/calendar/deadlines', wrap(async (req, res) => {
  const days = +(req.query.days as string) || 14;
  const data = await adminService.getUpcomingDeadlines(days);
  res.json({ success: true, data } satisfies ApiResponse);
}));

// ── AI Sessions Extended ───────────────────────────────────────────────────────
router.delete('/assistant/sessions/:id', wrap(async (req, res) => {
  await adminService.deleteChatSession(req.params.id);
  res.json({ success: true, data: { message: 'Session deleted' } } satisfies ApiResponse);
}));

// ── Activity Feed ─────────────────────────────────────────────────────────────
router.get('/activity', wrap(async (req, res) => {
  const result = await adminService.getActivity(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

// ── Visitor Journey Analytics ─────────────────────────────────────────────────
router.get('/visitor-analytics', wrap(async (req, res) => {
  const days = +(req.query.days as string) || 30;
  const data = await adminService.getVisitorAnalytics(days);
  res.json({ success: true, data } satisfies ApiResponse);
}));

// ── AI Performance & Metrics Analytics ─────────────────────────────────────────
router.get('/analytics/ai', wrap(async (req, res) => {
  const totalSessions = await prisma.chatSession.count();
  const activeSessions = await prisma.chatSession.count({ where: { status: 'active' } });
  const closedSessions = await prisma.chatSession.count({ where: { status: 'closed' } });
  
  const avgMessageCountResult = await prisma.chatSession.aggregate({
    _avg: { messageCount: true }
  });
  const avgMessageCount = Math.round(avgMessageCountResult._avg.messageCount || 0);

  const assistantMessages = await prisma.aiConversation.findMany({
    where: { role: 'assistant' },
    select: { metadata: true, intent: true, createdAt: true }
  });

  let totalTokens = 0;
  let totalLatency = 0;
  let latencyCount = 0;
  const providerStats: Record<string, { tokens: number; count: number }> = {};
  const intentStats: Record<string, number> = {};
  
  const dailyStats: Record<string, { tokens: number; latencySum: number; count: number }> = {};

  for (const msg of assistantMessages) {
    const meta = msg.metadata && typeof msg.metadata === 'object' ? (msg.metadata as any) : null;
    const intent = msg.intent || 'General Inquiry';
    intentStats[intent] = (intentStats[intent] || 0) + 1;

    if (meta) {
      const tokens = +meta.tokensUsed || 0;
      const latency = +meta.durationMs || 0;
      const provider = meta.provider || 'openai';

      totalTokens += tokens;
      if (latency > 0) {
        totalLatency += latency;
        latencyCount++;
      }

      if (!providerStats[provider]) {
        providerStats[provider] = { tokens: 0, count: 0 };
      }
      providerStats[provider].tokens += tokens;
      providerStats[provider].count += 1;

      const dateStr = msg.createdAt.toISOString().split('T')[0];
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = { tokens: 0, latencySum: 0, count: 0 };
      }
      dailyStats[dateStr].tokens += tokens;
      if (latency > 0) {
        dailyStats[dateStr].latencySum += latency;
        dailyStats[dateStr].count += 1;
      }
    }
  }

  const avgLatency = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0;

  const dailyTimeline = Object.entries(dailyStats)
    .map(([date, stats]) => ({
      date,
      tokens: stats.tokens,
      avgLatency: stats.count > 0 ? Math.round(stats.latencySum / stats.count) : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  res.json({
    success: true,
    data: {
      sessions: {
        total: totalSessions,
        active: activeSessions,
        closed: closedSessions,
        avgMessages: avgMessageCount
      },
      tokens: {
        total: totalTokens,
        byProvider: Object.entries(providerStats).map(([provider, stat]) => ({
          provider,
          tokens: stat.tokens,
          avgTokens: stat.count > 0 ? Math.round(stat.tokens / stat.count) : 0
        }))
      },
      latency: {
        avg: avgLatency
      },
      intents: Object.entries(intentStats).map(([intent, count]) => ({
        intent,
        count
      })),
      timeline: dailyTimeline
    }
  } satisfies ApiResponse);
}));

// ── Newsletter CRUD ─────────────────────────────────────────────────────────
router.get('/newsletter', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const result = await adminService.getNewsletters({ ...pq(q), search: q.search });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/newsletter', wrap(async (req, res) => {
  const item = await adminService.createNewsletter(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/newsletter/:id', wrap(async (req, res) => {
  await adminService.deleteNewsletter(req.params.id);
  res.json({ success: true, data: { message: 'Subscriber deleted' } } satisfies ApiResponse);
}));

// ── Campaigns CRUD ──────────────────────────────────────────────────────────
router.get('/campaigns', wrap(async (req, res) => {
  const result = await adminService.getCampaigns(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/campaigns', wrap(async (req, res) => {
  const item = await adminService.createCampaign(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/campaigns/:id', wrap(async (req, res) => {
  const item = await adminService.updateCampaign(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/campaigns/:id', wrap(async (req, res) => {
  await adminService.deleteCampaign(req.params.id);
  res.json({ success: true, data: { message: 'Campaign deleted' } } satisfies ApiResponse);
}));

// ── ProductIdeas CRUD ────────────────────────────────────────────────────────
router.get('/product-ideas', wrap(async (req, res) => {
  const result = await adminService.getProductIdeas(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/product-ideas', wrap(async (req, res) => {
  const item = await adminService.createProductIdea(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/product-ideas/:id', wrap(async (req, res) => {
  const item = await adminService.updateProductIdea(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/product-ideas/:id', wrap(async (req, res) => {
  await adminService.deleteProductIdea(req.params.id);
  res.json({ success: true, data: { message: 'Product idea deleted' } } satisfies ApiResponse);
}));

// ── RoadmapItems CRUD ────────────────────────────────────────────────────────
router.get('/roadmap-items', wrap(async (req, res) => {
  const result = await adminService.getRoadmapItems(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/roadmap-items', wrap(async (req, res) => {
  const item = await adminService.createRoadmapItem(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/roadmap-items/:id', wrap(async (req, res) => {
  const item = await adminService.updateRoadmapItem(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/roadmap-items/:id', wrap(async (req, res) => {
  await adminService.deleteRoadmapItem(req.params.id);
  res.json({ success: true, data: { message: 'Roadmap item deleted' } } satisfies ApiResponse);
}));

// ── Partnerships CRUD ────────────────────────────────────────────────────────
router.get('/partnerships', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const result = await adminService.getPartnershipRequests({ ...pq(q), status: q.status });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/partnerships', wrap(async (req, res) => {
  const item = await adminService.createPartnershipRequest(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/partnerships/:id', wrap(async (req, res) => {
  const item = await adminService.updatePartnershipRequest(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/partnerships/:id', wrap(async (req, res) => {
  await adminService.deletePartnershipRequest(req.params.id);
  res.json({ success: true, data: { message: 'Partnership request deleted' } } satisfies ApiResponse);
}));

// ── AI Prompts CRUD ──────────────────────────────────────────────────────────
router.get('/ai-prompts', wrap(async (req, res) => {
  const result = await adminService.getAiPrompts(pq(req.query as Record<string, string>));
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.post('/ai-prompts', wrap(async (req, res) => {
  const item = await adminService.createAiPrompt(req.body);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.put('/ai-prompts/:id', wrap(async (req, res) => {
  const item = await adminService.updateAiPrompt(req.params.id, req.body);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.delete('/ai-prompts/:id', wrap(async (req, res) => {
  await adminService.deleteAiPrompt(req.params.id);
  res.json({ success: true, data: { message: 'AI Prompt deleted' } } satisfies ApiResponse);
}));

// ── Presence CRUD ────────────────────────────────────────────────────────────
router.put('/presence', wrap(async (req, res) => {
  const { status } = req.body as { status: string };
  const allowed = ['Online', 'Busy', 'Meeting', 'Away', 'Vacation', 'Offline'];
  if (!allowed.includes(status)) {
    res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Invalid presence status' } });
    return;
  }
  await prisma.siteSetting.upsert({
    where: { key: 'presence_state' },
    update: { value: status },
    create: { key: 'presence_state', value: status, type: 'string', category: 'general' }
  });
  res.json({ success: true, data: { status } } satisfies ApiResponse);
}));

// ── AI Settings CRUD ──────────────────────────────────────────────────────────
router.get('/ai-settings', wrap(async (_req, res) => {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { startsWith: 'ai_' } }
  });
  const data = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));
  res.json({ success: true, data } satisfies ApiResponse);
}));

router.put('/ai-settings', wrap(async (req, res) => {
  const updates = req.body as Record<string, string>;
  const txs = Object.entries(updates).map(([key, value]) =>
    prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, type: 'string', category: 'ai' }
    })
  );
  await prisma.$transaction(txs);
  res.json({ success: true, data: { message: 'AI Settings updated successfully' } } satisfies ApiResponse);
}));

// ── AI Knowledge Base — Thin CRUD Controllers (delegate to Pipeline) ──────────
//
// Routes are responsible for: validate HTTP input → call pipeline → return response.
// All processing logic lives in knowledge-pipeline.service.ts.

// GET /admin/ai-knowledge?status=published&category=policy
router.get('/ai-knowledge', wrap(async (req, res) => {
  const { status, category } = req.query as Record<string, string>;
  const where: Record<string, any> = {};
  if (status) where.status = status;
  if (category) where.category = category;
  const items = await prisma.aiKnowledgeItem.findMany({
    where,
    orderBy: { updatedAt: 'desc' }
  });
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// GET /admin/ai-knowledge/health — operational metrics
router.get('/ai-knowledge/health', wrap(async (_req, res) => {
  const metrics = await knowledgePipeline.getHealthMetrics();
  res.json({ success: true, data: metrics } satisfies ApiResponse);
}));

// GET /admin/ai-knowledge/:id/versions — version history
router.get('/ai-knowledge/:id/versions', wrap(async (req, res) => {
  const versions = await prisma.aiKnowledgeVersion.findMany({
    where: { knowledgeItemId: req.params.id },
    orderBy: { version: 'desc' }
  });
  res.json({ success: true, data: versions } satisfies ApiResponse);
}));

// POST /admin/ai-knowledge — create with pipeline
router.post('/ai-knowledge', wrap(async (req, res) => {
  const { 
    title, content, category, status, source, 
    reviewInterval, lastReviewedAt, validFrom, validUntil, 
    relationships, tags, skipDuplicateCheck 
  } = req.body;
  const user = req.user!;

  const { item, result } = await knowledgePipeline.processCreate(
    { 
      title, content, category, status, source, 
      reviewInterval, lastReviewedAt, validFrom, validUntil, 
      relationships, tags 
    },
    { userId: user.id, userEmail: user.email },
    skipDuplicateCheck === true
  );

  if (!result.success && result.duplicateWarning) {
    res.status(409).json({
      success: false,
      code: 'DUPLICATE_DETECTED',
      data: result.duplicateWarning
    });
    return;
  }

  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

// POST /admin/ai-knowledge/reindex — force full re-index
router.post('/ai-knowledge/reindex', wrap(async (req, res) => {
  const user = req.user!;
  const count = await knowledgePipeline.processReindex({ userId: user.id, userEmail: user.email });
  res.json({ success: true, data: { message: `Re-indexed ${count} published document(s) successfully` } } satisfies ApiResponse);
}));

// PUT /admin/ai-knowledge/:id — update with pipeline
router.put('/ai-knowledge/:id', wrap(async (req, res) => {
  const { 
    title, content, category, status, source,
    reviewInterval, lastReviewedAt, validFrom, validUntil,
    relationships, tags
  } = req.body;
  const user = req.user!;

  const { item } = await knowledgePipeline.processUpdate(
    req.params.id,
    { 
      title, content, category, status, source,
      reviewInterval, lastReviewedAt, validFrom, validUntil,
      relationships, tags
    },
    { userId: user.id, userEmail: user.email }
  );

  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// POST /admin/ai-knowledge/:id/restore/:versionId — restore historical version snapshot
router.post('/ai-knowledge/:id/restore/:versionId', wrap(async (req, res) => {
  const { id, versionId } = req.params;
  const user = req.user!;

  const versionRecord = await prisma.aiKnowledgeVersion.findFirst({
    where: { id: versionId, knowledgeItemId: id }
  });
  if (!versionRecord) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Version record not found' } });
    return;
  }

  const { item } = await knowledgePipeline.processUpdate(
    id,
    {
      title: versionRecord.title,
      content: versionRecord.content,
      status: versionRecord.status,
      reviewInterval: versionRecord.reviewInterval,
      lastReviewedAt: versionRecord.lastReviewedAt,
      validFrom: versionRecord.validFrom,
      validUntil: versionRecord.validUntil,
      relationships: versionRecord.relationships as any,
      tags: versionRecord.tags
    },
    { userId: user.id, userEmail: user.email }
  );

  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// DELETE /admin/ai-knowledge/:id — delete with pipeline
router.delete('/ai-knowledge/:id', wrap(async (req, res) => {
  const user = req.user!;
  await knowledgePipeline.processDelete(req.params.id, { userId: user.id, userEmail: user.email });
  res.json({ success: true, data: { message: 'Knowledge document deleted and removed from index' } } satisfies ApiResponse);
}));

import * as knowledgeOps from '../ai/services/knowledge-ops.service';

// GET /admin/ai-knowledge/ops/jobs — registry of background jobs
router.get('/ai-knowledge/ops/jobs', wrap(async (req, res) => {
  const jobs = await prisma.aiKnowledgeJob.findMany({
    orderBy: { name: 'asc' }
  });
  res.json({ success: true, data: jobs } satisfies ApiResponse);
}));

// GET /admin/ai-knowledge/ops/logs — registry of audit log events
router.get('/ai-knowledge/ops/logs', wrap(async (req, res) => {
  const logs = await prisma.aiKnowledgeAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  res.json({ success: true, data: logs } satisfies ApiResponse);
}));

// GET /admin/ai-knowledge/ops/health — dynamic health status of all engines
router.get('/ai-knowledge/ops/health', wrap(async (req, res) => {
  const health = await knowledgeOps.getHealthDashboard();
  res.json({ success: true, data: health } satisfies ApiResponse);
}));

// GET /admin/ai-knowledge/ops/metrics — aggregated statistics
router.get('/ai-knowledge/ops/metrics', wrap(async (req, res) => {
  const metrics = await knowledgeOps.getOpsMetrics();
  res.json({ success: true, data: metrics } satisfies ApiResponse);
}));

// POST /admin/ai-knowledge/ops/trigger — manually execute automated tasks
router.post('/ai-knowledge/ops/trigger', wrap(async (req, res) => {
  const { action } = req.body;
  const user = req.user!;
  
  if (!action) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'action is required' } });
    return;
  }

  logger.info(`[Knowledge Ops] Manual trigger: "${action}" by ${user.email}`);

  switch (action) {
    case 'rebuild_index':
      knowledgeOps.runJobWithRetry('Rebuild Search Index', knowledgeOps.executeRebuildIndex, `admin_manual:${user.email}`);
      break;
    case 'run_dup_scan':
      knowledgeOps.runJobWithRetry('Run Duplicate Scan', knowledgeOps.executeDuplicateScan, `admin_manual:${user.email}`);
      break;
    case 'recalc_quality':
      knowledgeOps.runJobWithRetry('Recalculate Quality', knowledgeOps.executeRecalculateQuality, `admin_manual:${user.email}`);
      break;
    case 'regen_tags':
      knowledgeOps.runJobWithRetry('Regenerate Tags', knowledgeOps.executeRegenerateTags, `admin_manual:${user.email}`);
      break;
    case 'refresh_rels':
      knowledgeOps.runJobWithRetry('Refresh Relationships', knowledgeOps.executeRefreshRelationships, `admin_manual:${user.email}`);
      break;
    case 'run_scheduler':
      knowledgeOps.runJobWithRetry('Run Review Scheduler', knowledgeOps.executeReviewScheduler, `admin_manual:${user.email}`);
      break;
    default:
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: `Unknown action: "${action}"` } });
      return;
  }

  res.json({ success: true, data: { message: `Task "${action}" triggered in the background successfully.` } } satisfies ApiResponse);
}));

// AI Copilot Imports
import { aiOrchestrator } from '../ai/orchestrator';
import { conversationService } from '../ai/services/conversation.service';
import { adminCopilotService } from '../ai/services/admin-copilot.service';
import { env } from '../config/env';

// GET /admin/ai-copilot/context — fetch live platform context snapshot for the Copilot panel
router.get('/ai-copilot/context', wrap(async (_req, res) => {
  const context = await adminCopilotService.getPlatformContext();
  res.json({ success: true, data: context } satisfies ApiResponse);
}));

// GET /admin/ai-copilot/sessions/:sessionId/history — retrieve admin copilot conversation history
router.get('/ai-copilot/sessions/:sessionId/history', wrap(async (req, res) => {
  const history = await conversationService.getSessionHistory(req.params.sessionId);
  res.json({ success: true, data: { messages: history } } satisfies ApiResponse);
}));

// POST /admin/ai-copilot/chat — stream chat response with Forced Admin role
router.post('/ai-copilot/chat', wrap(async (req, res) => {
  if (!env.AI_ADMIN_COPILOT) {
    res.status(503).json({ success: false, error: { code: 'FEATURE_DISABLED', message: 'Admin AI Copilot is not enabled on this platform.' } });
    return;
  }

  const { message, sessionId } = req.body;
  const user = req.user!;

  if (!message || message.trim().length === 0) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Message is required' } });
    return;
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const output = await aiOrchestrator.processMessage(
      {
        message,
        sessionId,
        visitorId: `admin_${user.id}`,
        userRole: 'admin' // Force Admin mode — bypasses visitor guards and loads admin context
      },
      (token) => {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    );

    res.write(`data: ${JSON.stringify({
      sessionId: output.sessionId,
      intent: output.intent
    })}\n\n`);
    res.end();
  } catch (err: any) {
    logger.error('[Admin Copilot] Chat stream error:', err);
    res.write(`data: ${JSON.stringify({ token: 'An error occurred in Admin AI Copilot. Please check system status and try again.' })}\n\n`);
    res.end();
  }
}));

// ── Content AI generation Endpoint ──────────────────────────────────────────
router.post('/content/generate', wrap(async (req, res) => {
  const { z } = await import('zod');
  const { getAIProvider } = await import('../ai/providers');
  const { knowledgeService } = await import('../ai/services/knowledge.service');

  const generateSchema = z.object({
    type: z.enum(['proposal', 'email', 'contract', 'blog', 'case_study', 'email_welcome', 'email_followup', 'email_reminder', 'email_proposal', 'email_quotation']),
    topic: z.string().min(1),
    context: z.string().optional(),
  });

  const { type, topic, context } = generateSchema.parse(req.body);

  // Retrieve relevant knowledge base documents using BM25 query matching the topic
  const docs = await knowledgeService.retrieve(topic, 5);
  const factsText = docs.map(d => `[${d.title}]: ${d.content}`).join('\n');

  const typeLabels: Record<string, string> = {
    proposal: 'Business Proposal',
    email: 'Client Follow-up Email',
    contract: 'Professional Service Contract Agreement',
    blog: 'Blog Article Draft',
    case_study: 'Project Case Study Success Story',
    email_welcome: 'Welcome Email for New Clients',
    email_followup: 'Follow-up Email for Cold Leads/Inquiries',
    email_reminder: 'Payment/Milestone Reminder Email',
    email_proposal: 'Business Proposal Submission Cover Email',
    email_quotation: 'Service Quotation Delivery Cover Email'
  };

  const systemMessage = `You are Denis Chamkaga's Business Writing Assistant. 
Generate a professional document of type: "${typeLabels[type] || type}" based on Denis's verified business knowledge.
Your writing style is crisp, consultative, and professional.

Verified Facts from Denis's database:
${factsText || 'Denis Chamkaga is a Business Information Technology Consultant from Dar es Salaam, Tanzania.'}

Instructions:
1. Rely ONLY on the verified facts provided above. Do NOT make up services or credentials.
2. Tone: Consultative, professional, and clear.
3. Language: Respond in English (or Swahili if the topic/context is written in Swahili).`;

  const userMessage = `Please draft a "${typeLabels[type] || type}" regarding the following details:
Topic/Target: ${topic}
Additional context: ${context || 'N/A'}`;

  const messages = [
    { role: 'system' as const, content: systemMessage },
    { role: 'user' as const, content: userMessage }
  ];

  const provider = getAIProvider();
  const result = await provider.generate(messages);
  
  res.json({
    success: true,
    data: {
      document: result.content,
      type,
      tokensUsed: result.tokensUsed || 0,
      model: env.OPENAI_MODEL
    }
  } satisfies ApiResponse);
}));

// ── WebRTC Admin Signaling Routes ─────────────────────────────────────────────
// ── WebRTC Admin Signaling Routes ─────────────────────────────────────────────
router.get('/webrtc/offers', wrap(async (req, res) => {
  const activeOffers = webrtcSignaling.getActiveOffers();
  const db = (await import('../config/database')).default;
  
  const offers = await Promise.all(activeOffers.map(async (off) => {
    const chatSession = await db.chatSession.findUnique({
      where: { id: off.sessionId },
      include: { lead: true }
    });
    const callSession = await db.callSession.findUnique({
      where: { sessionId: off.sessionId }
    });
    const meta = (chatSession?.metadata as any) || {};
    return {
      sessionId: off.sessionId,
      sdpOffer: off.sdpOffer,
      callerName: chatSession?.lead?.name || meta.visitorName || 'Unknown Visitor',
      email: chatSession?.lead?.email || meta.email || undefined,
      company: chatSession?.lead?.company || meta.company || undefined,
      page: meta.currentPage || 'Denis Assistant Page',
      interest: meta.intent || 'General Consultation',
      leadScore: chatSession?.lead?.score || 0,
      temperature: chatSession?.lead?.temperature || 'cold',
      customerBrief: callSession?.customerBrief || null
    };
  }));

  res.json({ success: true, data: { offers } } satisfies ApiResponse);
}));

router.get('/webrtc/calls', wrap(async (req, res) => {
  const search = req.query.search as string;
  const db = (await import('../config/database')).default;

  const where: any = {};
  if (search) {
    where.OR = [
      { callerName: { contains: search, mode: 'insensitive' } },
      { receiverName: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { denisNotes: { contains: search, mode: 'insensitive' } },
      { nextAction: { contains: search, mode: 'insensitive' } },
      { lead: { name: { contains: search, mode: 'insensitive' } } },
      { lead: { company: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const calls = await db.callSession.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { lead: true }
  });

  res.json({ success: true, data: calls } satisfies ApiResponse);
}));

router.post('/webrtc/crm-summary', wrap(async (req, res) => {
  const { sessionId, rawNotes } = req.body;
  if (!sessionId) {
    res.status(400).json({ success: false, error: { message: 'sessionId is required' } });
    return;
  }
  const { leadIntelligenceService } = await import('../ai/services/lead-intelligence.service');
  const summary = await leadIntelligenceService.generateCRMSummary(sessionId, rawNotes || '');
  res.json({ success: true, data: summary });
}));

router.post('/webrtc/crm-sync', wrap(async (req, res) => {
  const { sessionId, rawNotes, summary } = req.body;
  if (!sessionId || !summary) {
    res.status(400).json({ success: false, error: { message: 'sessionId and summary are required' } });
    return;
  }
  const db = (await import('../config/database')).default;
  const callSession = await db.callSession.findUnique({ where: { sessionId } });
  
  if (callSession) {
    const chatSession = await db.chatSession.findUnique({
      where: { id: sessionId },
      include: { lead: true }
    });

    const currentScore = chatSession?.lead?.score || 50;
    const probPercent = parseInt(summary.probabilityOfClosing) || 75;
    const leadScoreAfter = Math.min(100, Math.max(currentScore, probPercent));

    await db.callSession.update({
      where: { id: callSession.id },
      data: {
        denisNotes: rawNotes || '',
        summary: JSON.stringify(summary),
        leadScoreAfter,
        salesStage: 'qualified',
        nextAction: summary.nextAction || 'Follow up with proposal'
      }
    });

    const { aiEventBus } = await import('../ai/event-bus');
    aiEventBus.publish('VoiceCallSummaryGenerated', {
      sessionId,
      callSessionId: callSession.id,
      summary,
      rawNotes,
      leadScoreAfter
    });
  }

  res.json({ success: true });
}));

router.post('/webrtc/answer', wrap(async (req, res) => {
  const { sessionId, sdpAnswer } = req.body;
  if (!sessionId || !sdpAnswer) {
    res.status(400).json({ success: false, error: { message: 'sessionId and sdpAnswer are required' } });
    return;
  }
  const callSession = await prisma.callSession.findUnique({ where: { sessionId } });
  if (!callSession || !['initiated', 'ringing', 'connecting'].includes(callSession.status)) {
    res.status(409).json({ success: false, error: { code: 'INVALID_CALL_TRANSITION', message: `Call cannot be answered from ${callSession?.status || 'missing'} state` } });
    return;
  }
  webrtcSignaling.registerAnswer(sessionId, sdpAnswer);
  await prisma.callSession.update({
    where: { id: callSession.id },
    data: { status: 'connected', answeredAt: new Date() }
  });
  await prisma.callLog.create({
    data: { callSessionId: callSession.id, event: 'join', detail: 'Authenticated operator accepted the call' }
  });
  res.json({ success: true, message: 'SDP Answer registered' });
}));

router.post('/webrtc/candidate', wrap(async (req, res) => {
  const { sessionId, candidate } = req.body;
  if (!sessionId || !candidate) {
    res.status(400).json({ success: false, error: { message: 'sessionId and candidate are required' } });
    return;
  }
  webrtcSignaling.addCandidate(sessionId, 'admin', candidate);
  res.json({ success: true, message: 'ICE candidate registered' });
}));

router.get('/webrtc/candidates/:sessionId', wrap(async (req, res) => {
  const candidates = webrtcSignaling.getCandidates(req.params.sessionId, 'visitor');
  res.json({ success: true, data: { candidates } });
}));

router.post('/webrtc/hangup/:sessionId', wrap(async (req, res) => {
  webrtcSignaling.clearSession(req.params.sessionId);
  res.json({ success: true, message: 'Session cleaned up' });
}));

// ── Business/ERP Inventory Routes ─────────────────────────────────────────────
router.get('/erp/inventory', wrap(async (req, res) => {
  const query = pq(req.query as Record<string, string>);
  const skip = (query.page - 1) * query.limit;
  
  const where: any = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { sku: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy || 'name']: query.sortOrder || 'asc' }
    }),
    prisma.inventoryItem.count({ where })
  ]);

  res.json({
    success: true,
    data: items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  });
}));

router.post('/erp/inventory', wrap(async (req, res) => {
  const item = await prisma.inventoryItem.create({ data: req.body });
  res.status(201).json({ success: true, data: item });
}));

router.put('/erp/inventory/:id', wrap(async (req, res) => {
  const item = await prisma.inventoryItem.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json({ success: true, data: item });
}));

router.delete('/erp/inventory/:id', wrap(async (req, res) => {
  await prisma.inventoryItem.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Inventory item deleted' });
}));


// ── Business/ERP Financial Ledger Routes ──────────────────────────────────────
router.get('/erp/ledger', wrap(async (req, res) => {
  const query = pq(req.query as Record<string, string>);
  const skip = (query.page - 1) * query.limit;

  const where: any = {};
  if (query.search) {
    where.OR = [
      { reference: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' }
    }),
    prisma.financialTransaction.count({ where })
  ]);

  res.json({
    success: true,
    data: items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  });
}));

router.post('/erp/ledger', wrap(async (req, res) => {
  const tx = await prisma.financialTransaction.create({
    data: {
      ...req.body,
      amount: parseFloat(req.body.amount)
    }
  });
  res.status(201).json({ success: true, data: tx });
}));

router.get('/erp/reports', wrap(async (req, res) => {
  const txs = await prisma.financialTransaction.findMany();
  
  let totalRevenue = 0;
  let totalExpenses = 0;
  
  for (const t of txs) {
    if (t.type === 'income') {
      totalRevenue += t.amount.toNumber();
    } else if (t.type === 'expense') {
      totalExpenses += t.amount.toNumber();
    }
  }
  
  const netBalance = totalRevenue - totalExpenses;
  
  res.json({
    success: true,
    data: {
      totalRevenue,
      totalExpenses,
      netBalance,
      transactionCount: txs.length
    }
  });
}));

export default router;
