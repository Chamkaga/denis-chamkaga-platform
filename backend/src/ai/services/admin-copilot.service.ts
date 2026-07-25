// src/ai/services/admin-copilot.service.ts
// Fetches a real-time operational snapshot of the platform to inject into the
// Admin AI Copilot system prompt. This allows the Copilot to answer questions
// like "how many hot leads do I have?" or "what is the knowledge base status?" accurately.

import prisma from '../../config/database';
import { logger } from '../../utils/logger';

export interface AdminPlatformContext {
  generatedAt: string;

  // CRM Snapshot
  leads: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    newToday: number;
    recentHot: Array<{ name: string; email: string; industry: string; temperature: string }>;
  };

  // Messaging
  messages: {
    totalUnread: number;
    recentSubjects: string[];
  };

  // AI Conversations
  chatSessions: {
    activeSessions: number;
    totalLast7Days: number;
    averageLeadScore: number;
  };

  // Knowledge Base
  knowledge: {
    totalDocuments: number;
    bySource: Record<string, number>;
  };

  // Content
  content: {
    publishedPosts: number;
    draftPosts: number;
    activeServices: number;
    totalProjects: number;
  };

  // Platform Settings Snapshot
  platformSettings: {
    siteName: string;
    siteTagline: string;
    contactEmail: string;
    contactLocation: string;
  };
}

export const adminCopilotService = {
  /**
   * Fetches a comprehensive live snapshot of the platform for the Admin Copilot.
   * Cached for 60 seconds to avoid hammering the DB on every message token.
   */
  _cache: null as { data: AdminPlatformContext; expiresAt: number } | null,

  async getPlatformContext(force = false): Promise<AdminPlatformContext> {
    const now = Date.now();
    if (!force && this._cache && this._cache.expiresAt > now) {
      return this._cache.data;
    }

    try {
      const startTime = Date.now();

      const [
        leadStats,
        recentHotLeads,
        unreadMessages,
        recentMessageSubjects,
        chatSessionStats,
        activeChatSessions,
        knowledgeDocs,
        blogStats,
        serviceCount,
        projectCount,
        siteSettings,
      ] = await Promise.all([
        // Lead count by temperature
        prisma.lead.groupBy({
          by: ['temperature'],
          _count: { id: true },
        }),

        // Top 5 hot leads
        prisma.lead.findMany({
          where: { temperature: 'hot' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { name: true, email: true, company: true, temperature: true },
        }),

        // Unread messages count
        prisma.message.count({ where: { isRead: false } }),

        // Recent message subjects (last 5)
        prisma.message.findMany({
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { subject: true },
        }),

        // Chat session stats for last 7 days
        prisma.chatSession.aggregate({
          where: { startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          _count: { id: true },
          _avg: { leadScore: true },
        }),

        // Active chat sessions count
        prisma.chatSession.count({ where: { status: 'active' } }),

        // Knowledge documents by category
        prisma.aiKnowledgeItem.groupBy({
          by: ['category'],
          _count: { id: true },
        }),

        // Blog post counts
        prisma.blogPost.groupBy({
          by: ['status'],
          where: { deletedAt: null },
          _count: { id: true },
        }),

        // Active services
        prisma.service.count({ where: { isActive: true } }),

        // Total projects
        prisma.project.count({ where: { deletedAt: null } }),

        // Key platform settings
        prisma.siteSetting.findMany({
          where: { key: { in: ['site_name', 'site_tagline', 'contact_email', 'contact_location'] } },
          select: { key: true, value: true },
        }),
      ]);

      // Process lead stats
      const leadByTemp: Record<string, number> = {};
      for (const row of leadStats) {
        const tempKey = row.temperature as string;
        leadByTemp[tempKey] = row._count.id;
      }

      // Process knowledge by category
      const knowledgeBySource: Record<string, number> = {};
      let totalKnowledgeDocs = 0;
      for (const row of knowledgeDocs) {
        knowledgeBySource[row.category] = row._count.id;
        totalKnowledgeDocs += row._count.id;
      }

      // Process blog stats
      const blogByStatus: Record<string, number> = {};
      for (const row of blogStats) {
        blogByStatus[row.status] = row._count.id;
      }

      // Process platform settings
      const settingsMap: Record<string, string> = {};
      for (const s of siteSettings) {
        settingsMap[s.key] = s.value;
      }

      // Today's new leads (rough approximation via recent leadStats)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const newTodayCount = await prisma.lead.count({
        where: { createdAt: { gte: todayStart } },
      });

      const context: AdminPlatformContext = {
        generatedAt: new Date().toISOString(),
        leads: {
          total: (leadByTemp.hot || 0) + (leadByTemp.warm || 0) + (leadByTemp.cold || 0),
          hot: leadByTemp.hot || 0,
          warm: leadByTemp.warm || 0,
          cold: leadByTemp.cold || 0,
          newToday: newTodayCount,
          recentHot: recentHotLeads.map(l => ({
            name: l.name || 'Unknown',
            email: l.email || 'N/A',
            industry: l.company || 'N/A',
            temperature: l.temperature as string,
          })),
        },
        messages: {
          totalUnread: unreadMessages,
          recentSubjects: recentMessageSubjects.map(m => m.subject || '(no subject)'),
        },
        chatSessions: {
          activeSessions: activeChatSessions,
          totalLast7Days: chatSessionStats._count.id,
          averageLeadScore: Math.round(chatSessionStats._avg.leadScore || 0),
        },
        knowledge: {
          totalDocuments: totalKnowledgeDocs,
          bySource: knowledgeBySource,
        },
        content: {
          publishedPosts: blogByStatus.published || 0,
          draftPosts: blogByStatus.draft || 0,
          activeServices: serviceCount,
          totalProjects: projectCount,
        },
        platformSettings: {
          siteName: settingsMap.site_name || 'Denis Chamkaga Platform',
          siteTagline: settingsMap.site_tagline || '',
          contactEmail: settingsMap.contact_email || 'contact@denischamkaga.com',
          contactLocation: settingsMap.contact_location || 'Dar es Salaam, Tanzania',
        },
      };

      // Cache for 60 seconds
      this._cache = { data: context, expiresAt: now + 60_000 };

      logger.info(`[AdminCopilotService] Platform context built in ${Date.now() - startTime}ms`);
      return context;
    } catch (err) {
      logger.error('[AdminCopilotService] Failed to fetch platform context:', err);

      // Return a safe empty context so the Copilot still works even if DB queries fail
      return {
        generatedAt: new Date().toISOString(),
        leads: { total: 0, hot: 0, warm: 0, cold: 0, newToday: 0, recentHot: [] },
        messages: { totalUnread: 0, recentSubjects: [] },
        chatSessions: { activeSessions: 0, totalLast7Days: 0, averageLeadScore: 0 },
        knowledge: { totalDocuments: 0, bySource: {} },
        content: { publishedPosts: 0, draftPosts: 0, activeServices: 0, totalProjects: 0 },
        platformSettings: {
          siteName: 'Denis Chamkaga Platform',
          siteTagline: '',
          contactEmail: 'contact@denischamkaga.com',
          contactLocation: 'Dar es Salaam, Tanzania',
        },
      };
    }
  },

  /**
   * Formats the platform context into a concise string for the AI system prompt.
   */
  formatForPrompt(ctx: AdminPlatformContext): string {
    const hotLeadsList = ctx.leads.recentHot.length > 0
      ? ctx.leads.recentHot.map(l => `  - ${l.name} (${l.industry}) <${l.email}>`).join('\n')
      : '  (none)';

    const knowledgeSources = Object.entries(ctx.knowledge.bySource)
      .map(([src, count]) => `${src}: ${count}`)
      .join(', ') || 'No documents indexed';

    const unreadSubjects = ctx.messages.recentSubjects.length > 0
      ? ctx.messages.recentSubjects.map(s => `  • ${s}`).join('\n')
      : '  (none)';

    return `[LIVE PLATFORM CONTEXT — Generated: ${ctx.generatedAt}]
Platform: ${ctx.platformSettings.siteName}
Location: ${ctx.platformSettings.contactLocation} | Contact: ${ctx.platformSettings.contactEmail}

=== CRM / LEADS ===
Total Leads: ${ctx.leads.total} | Hot: ${ctx.leads.hot} | Warm: ${ctx.leads.warm} | Cold: ${ctx.leads.cold}
New Today: ${ctx.leads.newToday}
Recent Hot Leads:
${hotLeadsList}

=== UNREAD MESSAGES ===
Unread Count: ${ctx.messages.totalUnread}
Recent Subjects:
${unreadSubjects}

=== AI CHAT SESSIONS ===
Active Right Now: ${ctx.chatSessions.activeSessions}
Last 7 Days: ${ctx.chatSessions.totalLast7Days} sessions | Avg Lead Score: ${ctx.chatSessions.averageLeadScore}%

=== KNOWLEDGE BASE ===
Total Documents: ${ctx.knowledge.totalDocuments}
By Source: ${knowledgeSources}

=== CONTENT ===
Blog Posts — Published: ${ctx.content.publishedPosts} | Drafts: ${ctx.content.draftPosts}
Active Services: ${ctx.content.activeServices}
Projects: ${ctx.content.totalProjects}`;
  },

  /**
   * Clears the cached context (call after significant DB mutations).
   */
  invalidateCache(): void {
    this._cache = null;
  },
};
