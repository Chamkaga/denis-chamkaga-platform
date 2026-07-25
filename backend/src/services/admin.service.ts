// src/services/admin.service.ts
// Admin CRUD operations for all managed resources.
// Every write operation is auth-protected and logged.

import prisma from '../config/database';
import { PaginationQuery } from '../types/api';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { getAIProvider } from '../ai/providers';

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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalProjects, completedProjects, inProgressProjects, plannedProjects,
      totalServices, publishedPosts, draftPosts,
      totalLeads, newLeads, hotLeads, totalMessages, unreadMessages,
      totalAppointments, pendingAppointments, completedConsultations, activeSessions,
      totalVisitors, todayVisitors, totalTestimonials,
      totalChatSessions, newsletterCount, totalPartnershipRequests,
      pendingPartnerships, activePromptsCount, totalCampaigns, activeCampaigns,
    ] = await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { status: 'completed', deletedAt: null } }),
      prisma.project.count({ where: { status: 'in_progress', deletedAt: null } }),
      prisma.project.count({ where: { status: 'planned', deletedAt: null } }),
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
      prisma.appointment.count({ where: { status: 'completed' } }),
      prisma.chatSession.count({ where: { status: 'active' } }),
      prisma.visitor.count(),
      prisma.visitor.count({ where: { firstVisit: { gte: startOfToday } } }),
      prisma.testimonial.count({ where: { isVisible: true } }),
      prisma.chatSession.count(),
      prisma.newsletter.count({ where: { status: 'active' } }),
      prisma.partnershipRequest.count(),
      prisma.partnershipRequest.count({ where: { status: 'new' } }),
      prisma.aiPrompt.count({ where: { isActive: true } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'active' } }),
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

    // ── Health Diagnostics ─────────────────────────────────────────────────────
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStart;
    } catch (e) {
      dbStatus = 'unhealthy';
    }

    let aiStatus = 'unhealthy';

    try {
      const provider = getAIProvider();
      const hc = await provider.healthCheck();
      aiStatus = hc.status === 'healthy' ? 'healthy' : 'unhealthy';
    } catch (e) {
      aiStatus = 'unhealthy';
    }

    // Pending requests = unread messages + pending appointments + new leads + pending partnerships
    const pendingRequests = unreadMessages + pendingAppointments + newLeads + pendingPartnerships;

    const supportersCount = await prisma.supporterProfile.count();
    const activeSupportersCount = await prisma.supporterProfile.count({ where: { status: 'active' } });
    const paidInvoices = await prisma.invoice.aggregate({ where: { status: 'paid' }, _sum: { total: true } });

    return {
      projects: {
        total: totalProjects,
        completed: completedProjects,
        inProgress: inProgressProjects,
        planned: plannedProjects
      },
      services: { total: totalServices },
      blog: { published: publishedPosts, drafts: draftPosts },
      leads: { total: totalLeads, new: newLeads, hot: hotLeads },
      messages: { total: totalMessages, unread: unreadMessages },
      appointments: { total: totalAppointments, pending: pendingAppointments, completed: completedConsultations },
      chat: { activeSessions, total: totalChatSessions },
      visitors: { total: totalVisitors, today: todayVisitors, returning: totalVisitors - todayVisitors },
      testimonials: { total: totalTestimonials },
      newsletters: { total: newsletterCount },
      partnerships: { total: totalPartnershipRequests, pending: pendingPartnerships },
      prompts: { activeCount: activePromptsCount },
      campaigns: { total: totalCampaigns, active: activeCampaigns },
      finance: { totalInvoiced: paidInvoices._sum.total?.toNumber() || 0 },
      supporters: { total: supportersCount, active: activeSupportersCount },
      recent: { leads: recentLeads, messages: recentMessages },
      pendingRequests,
      health: {
        api: 'healthy',
        database: dbStatus,
        dbResponseTimeMs: dbResponseTime,
        ai: aiStatus,
        aiProvider: 'openai',
        aiModel: env.OPENAI_MODEL,
      },
      storage: {
        used: '124MB',
        total: '10GB',
        percent: 1.24
      }
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

  async getAuditLogs(query: PaginationQuery) {
    return paginate(prisma.auditLog, {}, query, {
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
  },

  // ── Experiences CRUD ──────────────────────────────────────────────────────
  async getExperiences(query: PaginationQuery) {
    return paginate(prisma.experience, {}, query);
  },

  async createExperience(data: Prisma.ExperienceCreateInput) {
    return prisma.experience.create({ data });
  },

  async updateExperience(id: string, data: Prisma.ExperienceUpdateInput) {
    return prisma.experience.update({ where: { id }, data });
  },

  async deleteExperience(id: string) {
    return prisma.experience.delete({ where: { id } });
  },

  // ── Education CRUD ────────────────────────────────────────────────────────
  async getEducation(query: PaginationQuery) {
    return paginate(prisma.education, {}, query);
  },

  async createEducation(data: Prisma.EducationCreateInput) {
    return prisma.education.create({ data });
  },

  async updateEducation(id: string, data: Prisma.EducationUpdateInput) {
    return prisma.education.update({ where: { id }, data });
  },

  async deleteEducation(id: string) {
    return prisma.education.delete({ where: { id } });
  },

  // ── Certificates CRUD ─────────────────────────────────────────────────────
  async getCertificates(query: PaginationQuery) {
    return paginate(prisma.certificate, {}, query);
  },

  async createCertificate(data: Prisma.CertificateCreateInput) {
    return prisma.certificate.create({ data });
  },

  async updateCertificate(id: string, data: Prisma.CertificateUpdateInput) {
    return prisma.certificate.update({ where: { id }, data });
  },

  async deleteCertificate(id: string) {
    return prisma.certificate.delete({ where: { id } });
  },

  // ── Languages CRUD ────────────────────────────────────────────────────────
  async getLanguages(query: PaginationQuery) {
    return paginate(prisma.language, {}, query);
  },

  async createLanguage(data: Prisma.LanguageCreateInput) {
    return prisma.language.create({ data });
  },

  async updateLanguage(id: string, data: Prisma.LanguageUpdateInput) {
    return prisma.language.update({ where: { id }, data });
  },

  async deleteLanguage(id: string) {
    return prisma.language.delete({ where: { id } });
  },

  // ── FAQs CRUD ─────────────────────────────────────────────────────────────
  async getFaqs(query: PaginationQuery) {
    return paginate(prisma.faq, {}, query);
  },

  async createFaq(data: Prisma.FaqCreateInput) {
    return prisma.faq.create({ data });
  },

  async updateFaq(id: string, data: Prisma.FaqUpdateInput) {
    return prisma.faq.update({ where: { id }, data });
  },

  async deleteFaq(id: string) {
    return prisma.faq.delete({ where: { id } });
  },

  // ── Tutorials CRUD ────────────────────────────────────────────────────────
  async getTutorials(query: PaginationQuery) {
    return paginate(prisma.tutorial, {}, query);
  },

  async createTutorial(data: Prisma.TutorialCreateInput) {
    return prisma.tutorial.create({ data });
  },

  async updateTutorial(id: string, data: Prisma.TutorialUpdateInput) {
    return prisma.tutorial.update({ where: { id }, data });
  },

  async deleteTutorial(id: string) {
    return prisma.tutorial.delete({ where: { id } });
  },


  // ── AI Assistant Logs ─────────────────────────────────────────────────────
  async getChatSessions(query: PaginationQuery) {
    const updatedQuery = { ...query };
    if (!updatedQuery.sortBy || updatedQuery.sortBy === 'createdAt') {
      updatedQuery.sortBy = 'startedAt';
    }
    return paginate(prisma.chatSession, {}, updatedQuery, {
      include: {
        lead: { select: { name: true, email: true } },
      },
    });
  },

  async getChatSessionHistory(sessionId: string) {
    return prisma.aiConversation.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async deleteChatSession(sessionId: string) {
    await prisma.aiConversation.deleteMany({ where: { sessionId } });
    return prisma.chatSession.delete({ where: { id: sessionId } });
  },

  // ── Leads Extended ────────────────────────────────────────────────────────
  async createLead(data: any) {
    return prisma.lead.create({ data });
  },

  async deleteLead(id: string) {
    return prisma.lead.delete({ where: { id } });
  },

  // ── Messages Extended ─────────────────────────────────────────────────────
  async deleteMessage(id: string) {
    return prisma.message.delete({ where: { id } });
  },

  // ── Users Extended ────────────────────────────────────────────────────────
  async createUser(data: any) {
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(data.password || 'TempPass@2025', 12);
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.email.split('@')[0] + '_' + Date.now(),
        passwordHash,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        mustChangePassword: true,
        role: { connect: { name: data.roleName || 'admin' } },
      },
      include: { role: true },
    });
  },

  async resetUserPassword(id: string) {
    const bcrypt = await import('bcrypt');
    const tempPassword = `Denis@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });
    return { tempPassword };
  },

  // ── Scheduled Projects (Calendar) CRUD ────────────────────────────────────
  async getScheduledProjects(query: PaginationQuery & { status?: string; from?: string; to?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.deadline = {};
      if (query.from) where.deadline.gte = new Date(query.from);
      if (query.to) where.deadline.lte = new Date(query.to);
    }
    return paginate(prisma.scheduledProject, where, query);
  },

  async createScheduledProject(data: any) {
    return prisma.scheduledProject.create({ data });
  },

  async updateScheduledProject(id: string, data: any) {
    return prisma.scheduledProject.update({ where: { id }, data });
  },

  async deleteScheduledProject(id: string) {
    return prisma.scheduledProject.delete({ where: { id } });
  },

  async getUpcomingDeadlines(days = 14) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return prisma.scheduledProject.findMany({
      where: {
        deadline: { gte: now, lte: future },
        status: { notIn: ['completed', 'cancelled'] },
      },
      orderBy: { deadline: 'asc' },
      take: 10,
    });
  },

  // ── Activity / Audit Feed ─────────────────────────────────────────────────
  async getActivity(query: PaginationQuery) {
    return paginate(prisma.auditLog, {}, query, {
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  },

  // ── Visitor Journey Analytics ─────────────────────────────────────────────
  async getVisitorAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalVisitors,
      newVisitors,
      eventCounts,
      topPages,
      journeyFunnel,
    ] = await Promise.all([
      prisma.visitor.count(),
      prisma.visitor.count({ where: { firstVisit: { gte: since } } }),
      prisma.analytics.groupBy({
        by: ['eventType'],
        _count: { id: true },
        where: { createdAt: { gte: since } },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.analytics.groupBy({
        by: ['pagePath'],
        _count: { id: true },
        where: { createdAt: { gte: since }, pagePath: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      // Funnel: visitors → chatted → submitted form → booked consultation
      Promise.all([
        prisma.visitor.count(),
        prisma.chatSession.count(),
        prisma.message.count(),
        prisma.appointment.count(),
        prisma.lead.count({ where: { status: 'won' } }),
      ]),
    ]);

    return {
      summary: { totalVisitors, newVisitors },
      events: eventCounts.map((e) => ({ eventType: e.eventType, count: e._count.id })),
      topPages: topPages.map((p) => ({ path: p.pagePath, count: p._count.id })),
      funnel: {
        visitors: journeyFunnel[0],
        chatted: journeyFunnel[1],
        submitted: journeyFunnel[2],
        booked: journeyFunnel[3],
        converted: journeyFunnel[4],
      },
    };
  },

  // ── Backup export ─────────────────────────────────────────────────────────
  async exportDatabaseBackup() {
    const [
      users, roles, permissions, projects, services, blogPosts,
      categories, tags, leads, messages, appointments, chatSessions,
      aiConversations, siteSettings, testimonials, gallery, experiences,
      education, certificates, languages, faqs, scheduledProjects,
      newsletters, campaigns, productIdeas, roadmapItems, partnershipRequests, aiPrompts,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.role.findMany(),
      prisma.permission.findMany(),
      prisma.project.findMany(),
      prisma.service.findMany(),
      prisma.blogPost.findMany(),
      prisma.category.findMany(),
      prisma.tag.findMany(),
      prisma.lead.findMany(),
      prisma.message.findMany(),
      prisma.appointment.findMany(),
      prisma.chatSession.findMany(),
      prisma.aiConversation.findMany(),
      prisma.siteSetting.findMany(),
      prisma.testimonial.findMany(),
      prisma.gallery.findMany(),
      prisma.experience.findMany(),
      prisma.education.findMany(),
      prisma.certificate.findMany(),
      prisma.language.findMany(),
      prisma.faq.findMany(),
      prisma.scheduledProject.findMany(),
      prisma.newsletter.findMany(),
      prisma.campaign.findMany(),
      prisma.productIdea.findMany(),
      prisma.roadmapItem.findMany(),
      prisma.partnershipRequest.findMany(),
      prisma.aiPrompt.findMany(),
    ]);
    return {
      timestamp: new Date().toISOString(),
      data: {
        users, roles, permissions, projects, services, blogPosts,
        categories, tags, leads, messages, appointments, chatSessions,
        aiConversations, siteSettings, testimonials, gallery, experiences,
        education, certificates, languages, faqs, scheduledProjects,
        newsletters, campaigns, productIdeas, roadmapItems, partnershipRequests, aiPrompts,
      }
    };
  },

  // ── Newsletter CRUD ───────────────────────────────────────────────────────
  async getNewsletters(query: PaginationQuery & { search?: string }) {
    const where: any = {};
    if (query.search) {
      where.email = { contains: query.search, mode: 'insensitive' };
    }
    return paginate(prisma.newsletter, where, query);
  },
  async createNewsletter(data: { email: string; source?: string }) {
    return prisma.newsletter.create({ data });
  },
  async deleteNewsletter(id: string) {
    return prisma.newsletter.delete({ where: { id } });
  },

  // ── Campaign CRUD ─────────────────────────────────────────────────────────
  async getCampaigns(query: PaginationQuery) {
    return paginate(prisma.campaign, {}, query);
  },
  async createCampaign(data: any) {
    return prisma.campaign.create({ data });
  },
  async updateCampaign(id: string, data: any) {
    return prisma.campaign.update({ where: { id }, data });
  },
  async deleteCampaign(id: string) {
    return prisma.campaign.delete({ where: { id } });
  },

  // ── ProductIdea CRUD ───────────────────────────────────────────────────────
  async getProductIdeas(query: PaginationQuery) {
    return paginate(prisma.productIdea, {}, query);
  },
  async createProductIdea(data: any) {
    return prisma.productIdea.create({ data });
  },
  async updateProductIdea(id: string, data: any) {
    return prisma.productIdea.update({ where: { id }, data });
  },
  async deleteProductIdea(id: string) {
    return prisma.productIdea.delete({ where: { id } });
  },

  // ── RoadmapItem CRUD ───────────────────────────────────────────────────────
  async getRoadmapItems(query: PaginationQuery) {
    return paginate(prisma.roadmapItem, {}, query);
  },
  async createRoadmapItem(data: any) {
    return prisma.roadmapItem.create({ data });
  },
  async updateRoadmapItem(id: string, data: any) {
    return prisma.roadmapItem.update({ where: { id }, data });
  },
  async deleteRoadmapItem(id: string) {
    return prisma.roadmapItem.delete({ where: { id } });
  },

  // ── PartnershipRequest CRUD ────────────────────────────────────────────────
  async getPartnershipRequests(query: PaginationQuery & { status?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return paginate(prisma.partnershipRequest, where, query);
  },
  async createPartnershipRequest(data: any) {
    return prisma.partnershipRequest.create({ data });
  },
  async updatePartnershipRequest(id: string, data: any) {
    return prisma.partnershipRequest.update({ where: { id }, data });
  },
  async deletePartnershipRequest(id: string) {
    return prisma.partnershipRequest.delete({ where: { id } });
  },

  // ── AiPrompt CRUD ──────────────────────────────────────────────────────────
  async getAiPrompts(query: PaginationQuery) {
    return paginate(prisma.aiPrompt, {}, query);
  },
  async createAiPrompt(data: any) {
    return prisma.aiPrompt.create({ data });
  },
  async updateAiPrompt(id: string, data: any) {
    return prisma.aiPrompt.update({ where: { id }, data });
  },
  async deleteAiPrompt(id: string) {
    return prisma.aiPrompt.delete({ where: { id } });
  },
};

