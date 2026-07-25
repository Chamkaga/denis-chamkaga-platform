// backend/src/services/activity-timeline.service.ts
// Unified Contact & Relationship Timeline Engine

import prisma from '../config/database';

export interface TimelineEventItem {
  id: string;
  type: 'visit' | 'chat' | 'lead' | 'call' | 'consultation' | 'quotation' | 'invoice' | 'payment' | 'project' | 'support' | 'activity';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export class ActivityTimelineService {
  /**
   * Get Unified Operational Timeline for a specific contact email
   */
  async getUnifiedTimeline(email: string): Promise<TimelineEventItem[]> {
    const timeline: TimelineEventItem[] = [];

    // 1. Visitor Pageviews
    const firstChat = await prisma.chatSession.findFirst({ where: { lead: { email } }, select: { visitorId: true } });
    const visitor = firstChat?.visitorId ? await prisma.visitor.findUnique({ where: { id: firstChat.visitorId } }) : null;
    if (visitor) {
      timeline.push({
        id: `vis_${visitor.id}`,
        type: 'visit',
        title: 'Initial Website Visit',
        description: `Visitor accessed portal from IP ${visitor.ipAddress || 'unknown'} (${visitor.country || 'Tanzania'}). Total visits: ${visitor.visitCount}`,
        timestamp: visitor.firstVisit.toISOString()
      });
    }

    // 2. AI Chat Sessions
    const chats = await prisma.chatSession.findMany({
      where: { lead: { email } },
      orderBy: { startedAt: 'desc' },
      take: 10
    });
    for (const chat of chats) {
      const summaryText = (chat.metadata as any)?.summary;
      timeline.push({
        id: `chat_${chat.id}`,
        type: 'chat',
        title: 'AI Chat Conversation',
        description: summaryText || 'Visitor engaged in AI assistant consultation session.',
        timestamp: chat.startedAt.toISOString(),
        metadata: { score: chat.leadScore }
      });
    }

    // 3. Lead Qualification
    const leads = await prisma.lead.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' }
    });
    for (const l of leads) {
      timeline.push({
        id: `lead_${l.id}`,
        type: 'lead',
        title: `Lead Qualified (${l.status})`,
        description: `Requirements: ${l.requirements || 'Software Development'}. Lead Score: ${l.score}/100. Temperature: ${l.temperature}.`,
        timestamp: l.createdAt.toISOString()
      });
    }

    // 4. Voice Call Sessions & Incoming Call Intelligence
    const calls = await prisma.callSession.findMany({
      where: {
        OR: [
          { lead: { email } },
          { callerName: { contains: email, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    for (const c of calls) {
      timeline.push({
        id: `call_${c.id}`,
        type: 'call',
        title: `Voice Call Session (${c.status})`,
        description: c.summary || `Call session with ${c.callerName}. Duration: ${c.durationSec}s. Sentiment: ${c.sentiment || 'neutral'}.`,
        timestamp: c.createdAt.toISOString(),
        metadata: { actionItems: c.actionItems, quality: c.quality }
      });
    }

    // 5. Consultations & Meetings
    const consultations = await prisma.consultation.findMany({
      where: {
        OR: [
          { lead: { email } },
          { organization: { OR: [{ email }, { clients: { some: { email } } }] } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    for (const m of consultations) {
      timeline.push({
        id: `meeting_${m.id}`,
        type: 'consultation',
        title: `Consultation Meeting: ${m.title || 'Strategy'}`,
        description: m.notes || `Scheduled consultation on ${m.scheduledAt.toLocaleDateString()}. Status: ${m.status}`,
        timestamp: m.createdAt.toISOString()
      });
    }

    // 6. Quotations
    const quotations = await prisma.quotation.findMany({
      where: {
        organization: {
          OR: [
            { email },
            { clients: { some: { email } } }
          ]
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    for (const q of quotations) {
      timeline.push({
        id: `quote_${q.id}`,
        type: 'quotation',
        title: `Quotation ${q.quotationNumber} (${q.status})`,
        description: `Quotation amount: ${q.total.toString()} TZS. Title: ${q.title}`,
        timestamp: q.createdAt.toISOString()
      });
    }

    // 7. Invoices & Payments
    const payments = await prisma.payment.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' }
    });
    for (const p of payments) {
      timeline.push({
        id: `pay_${p.id}`,
        type: 'payment',
        title: `Payment Received (${p.paymentNumber})`,
        description: `Amount ${p.amount.toString()} ${p.currency} processed via ${p.gatewayName}. Transaction: ${p.gatewayTransactionId}`,
        timestamp: p.createdAt.toISOString()
      });
    }

    // 8. Support Contributions
    const supporter = await prisma.supporterProfile.findUnique({
      where: { email },
      include: { contributions: true }
    });
    if (supporter) {
      for (const ctr of supporter.contributions) {
        timeline.push({
          id: `sup_${ctr.id}`,
          type: 'support',
          title: `Vision Support Contribution (${ctr.tier})`,
          description: `Contributed ${ctr.amount || 0} ${ctr.currency} via ${ctr.paymentProvider}`,
          timestamp: ctr.createdAt.toISOString()
        });
      }
    }

    // 9. Business Activity Audit Trail
    const activities = await prisma.businessActivity.findMany({
      where: {
        OR: [
          { performedBy: email },
          { description: { contains: email, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    for (const act of activities) {
      timeline.push({
        id: `act_${act.id}`,
        type: 'activity',
        title: `System Event: ${act.action}`,
        description: act.description,
        timestamp: act.createdAt.toISOString()
      });
    }

    // Sort chronologically descending
    return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const activityTimelineService = new ActivityTimelineService();
