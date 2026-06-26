// src/services/admin.service.ts
// Admin CRUD operations for all managed resources.
// Every write operation is auth-protected and logged.

import prisma from '../config/database';
import { PaginationQuery } from '../types/api';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

// Helper: generate slug from title
function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Helper: paginate
async function paginate<T>(
  model: any,
  where: object,
  { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }: PaginationQuery,
  extra: object = {}
) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    model.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder }, ...extra }),
    model.count({ where }),
  ]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export const adminService = {
  // ── Dashboard Stats ────────────────────────────────────────────────────────
  async getDashboardStats() {
    const [
      totalProjects, totalServices, publishedPosts, draftPosts,
      totalLeads, newLeads, hotLeads, totalMessages, unreadMessages,
      totalAppointments, pendingAppointments, activeSessions,
      totalVisitors, totalTestimonials,
    ] = await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.blogPost.count({ where: { status: 'published', deletedAt: null } }),
      prisma.blogPost.count({ where: { status: 'draft', deletedAt: null } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.lead.count({ where: { temperature: 'hot' } }),
      prisma.message.count(),
      prisma.message.count({ where: { isRead: false } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'pending' } }),
      prisma.chatSession.count({ where: { status: 'active' } }),
      prisma.visitor.count(),
      prisma.testimonial.count({ where: { isVisible: true } }),
    ]);

    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, source: true, temperature: true, createdAt: true },
    });

    const recentMessages = await prisma.message.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, subject: true, isRead: true, createdAt: true },
    });

    return {
      projects: { total: totalProjects, published: totalProjects },
      services: { total: totalServices },
      blog: { published: publishedPosts, drafts: draftPosts },
      leads: { total: totalLeads, new: newLeads, hot: hotLeads },
      messages: { total: totalMessages, unread: unreadMessages },
      appointments: { total: totalAppointments, pending: pendingAppointments },
      chat: { activeSessions },
      visitors: { total: totalVisitors },
      testimonials: { total: totalTestimonials },
      recent: { leads: recentLeads, messages: recentMessages },
    };
  },

  // ── Projects ───────────────────────────────────────────────────────────────
  async getProjects(query: PaginationQuery) {
    return paginate(prisma.project, { deletedAt: null }, query, {
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
  },

  async createProject(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data });
  },

  async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({ where: { id }, data });
  },

  async deleteProject(id: string) {
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // ── Services ───────────────────────────────────────────────────────────────
  async getServices(query: PaginationQuery) {
    return paginate(prisma.service, {}, query);
  },

  async createService(data: Omit<Prisma.ServiceCreateInput, 'slug'> & { slug?: string }) {
    const slug = data.slug || toSlug(data.title as string);
    return prisma.service.create({ data: { ...(data as Prisma.ServiceCreateInput), slug } });
  },

  async updateService(id: string, data: Prisma.ServiceUpdateInput) {
    return prisma.service.update({ where: { id }, data });
  },

  async deleteService(id: string) {
    return prisma.service.update({ where: { id }, data: { isActive: false } });
  },

  // ── Blog Posts ─────────────────────────────────────────────────────────────
  async getBlogPosts(query: PaginationQuery) {
    return paginate(prisma.blogPost, { deletedAt: null }, query, {
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { firstName: true, lastName: true } },
      },
    });
  },

  async createBlogPost(data: Prisma.BlogPostCreateInput) {
    return prisma.blogPost.create({ data, include: { category: true, author: true } });
  },

  async updateBlogPost(id: string, data: Prisma.BlogPostUpdateInput) {
    return prisma.blogPost.update({ where: { id }, data, include: { category: true } });
  },

  async deleteBlogPost(id: string) {
    return prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // ── Leads ──────────────────────────────────────────────────────────────────
  async getLeads(query: PaginationQuery & { status?: string; temperature?: string }) {
    const { status, temperature, ...rest } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (temperature) where.temperature = temperature;
    return paginate(prisma.lead, where, rest, {
      include: { assignedTo: { select: { firstName: true, lastName: true } } },
    });
  },

  async updateLead(id: string, data: Prisma.LeadUpdateInput) {
    return prisma.lead.update({ where: { id }, data });
  },

  // ── Messages ───────────────────────────────────────────────────────────────
  async getMessages(query: PaginationQuery & { unreadOnly?: boolean }) {
    const { unreadOnly, ...rest } = query;
    const where = unreadOnly ? { isRead: false } : {};
    return paginate(prisma.message, where, rest);
  },

  async markMessageRead(id: string) {
    return prisma.message.update({ where: { id }, data: { isRead: true } });
  },

  // ── Appointments ───────────────────────────────────────────────────────────
  async getAppointments(query: PaginationQuery & { status?: string }) {
    const { status, ...rest } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    return paginate(prisma.appointment, where, rest);
  },

  async updateAppointment(id: string, data: Prisma.AppointmentUpdateInput) {
    return prisma.appointment.update({ where: { id }, data });
  },

  // ── Testimonials ───────────────────────────────────────────────────────────
  async getTestimonials(query: PaginationQuery) {
    return paginate(prisma.testimonial, {}, query);
  },

  async createTestimonial(data: Prisma.TestimonialCreateInput) {
    return prisma.testimonial.create({ data });
  },

  async updateTestimonial(id: string, data: Prisma.TestimonialUpdateInput) {
    return prisma.testimonial.update({ where: { id }, data });
  },

  async deleteTestimonial(id: string) {
    return prisma.testimonial.delete({ where: { id } });
  },

  // ── Gallery ────────────────────────────────────────────────────────────────
  async getGallery(query: PaginationQuery) {
    return paginate(prisma.gallery, {}, query);
  },

  async createGalleryItem(data: Prisma.GalleryCreateInput) {
    return prisma.gallery.create({ data });
  },

  async updateGalleryItem(id: string, data: Prisma.GalleryUpdateInput) {
    return prisma.gallery.update({ where: { id }, data });
  },

  async deleteGalleryItem(id: string) {
    return prisma.gallery.delete({ where: { id } });
  },

  // ── Site Settings ──────────────────────────────────────────────────────────
  async getSettings(category?: string) {
    const where = category ? { category } : {};
    return prisma.siteSetting.findMany({ where, orderBy: { key: 'asc' } });
  },

  async updateSetting(key: string, value: string) {
    return prisma.siteSetting.update({ where: { key }, data: { value } });
  },

  async updateSettings(updates: Array<{ key: string; value: string }>) {
    return Promise.all(updates.map(u => prisma.siteSetting.update({ where: { key: u.key }, data: { value: u.value } })));
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  async getUsers(query: PaginationQuery) {
    return paginate(prisma.user, {}, query, {
      include: { role: true },
      omit: { passwordHash: true },
    });
  },

  async toggleUserActive(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    return prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  async getAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await prisma.analytics.groupBy({
      by: ['eventType'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
    });
    return events.map(e => ({ eventType: e.eventType, count: e._count.id }));
  },

  // ── Audit Log ─────────────────────────────────────────────────────────────
  async createAuditLog(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValues?: object;
    newValues?: object;
    ipAddress?: string;
  }) {
    return prisma.auditLog.create({ data });
  },
};
