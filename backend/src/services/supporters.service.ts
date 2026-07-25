// backend/src/services/supporters.service.ts
import prisma from '../config/database';
import { SupportTier } from '@prisma/client';

export interface RecordContributionDTO {
  supporterEmail: string;
  supporterName: string;
  supporterPhone?: string;
  country?: string;
  amount: number;
  currency?: string;
  tier: SupportTier;
  paymentProvider?: string;
  paymentMethod?: string;
  reference?: string;
  supportType?: 'one_time' | 'recurring';
  notes?: string;
}

export class SupportersService {
  /**
   * Get Supporters Dashboard Overview & Official Tier Breakdown Metrics
   */
  async getSupportersOverview() {
    const totalSupporters = await prisma.supporterProfile.count();
    const activeSupporters = await prisma.supporterProfile.count({ where: { status: 'active' } });
    const recurringSupporters = await prisma.supporterProfile.count({ where: { isRecurring: true } });
    const oneTimeSupporters = await prisma.supporterProfile.count({ where: { isRecurring: false } });

    // Lifetime Revenue
    const lifetimeAggregate = await prisma.supportContribution.aggregate({
      where: { status: 'Paid' },
      _sum: { amount: true },
      _avg: { amount: true },
      _max: { amount: true },
      _count: { id: true },
    });

    // Monthly Revenue (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyAggregate = await prisma.supportContribution.aggregate({
      where: {
        status: 'Paid',
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Payment Statuses
    const pendingPayments = await prisma.supportContribution.count({ where: { status: 'Pending' } });
    const failedPayments = await prisma.supportContribution.count({ where: { status: 'Failed' } });

    // Tier Specific Breakdowns for Official Platform Tiers
    const tiers: SupportTier[] = ['SEED', 'GROWTH', 'VISION_BUILDER', 'MISSION_CHAMPION', 'CUSTOM'];
    const tierBreakdown: Record<string, any> = {};

    for (const t of tiers) {
      const tierMembers = await prisma.supporterProfile.count({ where: { tier: t } });
      const tierActive = await prisma.supporterProfile.count({ where: { tier: t, status: 'active' } });
      const tierLifetime = await prisma.supportContribution.aggregate({
        where: { tier: t, status: 'Paid' },
        _sum: { amount: true },
        _avg: { amount: true },
      });
      const tierMonthly = await prisma.supportContribution.aggregate({
        where: { tier: t, status: 'Paid', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      });

      tierBreakdown[t] = {
        tier: t,
        totalMembers: tierMembers,
        activeMembers: tierActive,
        monthlyRevenue: tierMonthly._sum.amount || 0,
        lifetimeRevenue: tierLifetime._sum.amount || 0,
        avgContribution: Math.round(tierLifetime._avg.amount || 0),
        renewalRate: tierMembers > 0 ? Math.round((tierActive / tierMembers) * 100) : 100,
      };
    }

    return {
      summary: {
        totalSupporters,
        activeSupporters,
        recurringSupporters,
        oneTimeSupporters,
        monthlyRevenue: monthlyAggregate._sum.amount || 0,
        lifetimeRevenue: lifetimeAggregate._sum.amount || 0,
        avgContribution: Math.round(lifetimeAggregate._avg.amount || 0),
        largestContribution: lifetimeAggregate._max.amount || 0,
        pendingPayments,
        failedPayments,
      },
      tierBreakdown,
    };
  }

  /**
   * List Supporters with Tier & Status Filtering
   */
  async getSupporters(params?: { tier?: SupportTier; status?: string; search?: string }) {
    const where: any = {};
    if (params?.tier) where.tier = params.tier;
    if (params?.status) where.status = params.status;
    if (params?.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { country: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return prisma.supporterProfile.findMany({
      where,
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { totalLifetimeAmount: 'desc' }
    });
  }

  /**
   * Record Supporter Contribution & Execute Automatic Multi-Module Synchronization
   */
  async recordContribution(dto: RecordContributionDTO) {
    const isRecurring = dto.supportType === 'recurring';
    const amount = +dto.amount;

    // 1. Upsert SupporterProfile in PostgreSQL
    const supporter = await prisma.supporterProfile.upsert({
      where: { email: dto.supporterEmail },
      update: {
        fullName: dto.supporterName,
        phone: dto.supporterPhone || undefined,
        country: dto.country || 'Tanzania',
        tier: dto.tier,
        isRecurring,
        supportType: dto.supportType || 'one_time',
        paymentProvider: dto.paymentProvider || 'DPO',
        paymentMethod: dto.paymentMethod || 'Card',
        totalLifetimeAmount: { increment: amount },
        status: 'active',
        renewalDate: isRecurring ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
      },
      create: {
        fullName: dto.supporterName,
        email: dto.supporterEmail,
        phone: dto.supporterPhone,
        country: dto.country || 'Tanzania',
        tier: dto.tier,
        isRecurring,
        supportType: dto.supportType || 'one_time',
        paymentProvider: dto.paymentProvider || 'DPO',
        paymentMethod: dto.paymentMethod || 'Card',
        totalLifetimeAmount: amount,
        status: 'active',
        renewalDate: isRecurring ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
      }
    });

    // 2. Log SupportContribution Record
    const ctrId = `CTR-${Date.now()}`;
    const receiptNo = `RCP-${Date.now()}`;
    const contribution = await prisma.supportContribution.create({
      data: {
        ctrId,
        receiptNo,
        supporterProfileId: supporter.id,
        supporterName: dto.supporterName,
        supporterEmail: dto.supporterEmail,
        supporterPhone: dto.supporterPhone,
        country: dto.country || 'Tanzania',
        tier: dto.tier,
        amount,
        currency: dto.currency || 'TZS',
        paymentProvider: dto.paymentProvider || 'DPO',
        paymentMethod: dto.paymentMethod || 'Mobile Money',
        reference: dto.reference || `REF_${Date.now()}`,
        status: 'Paid',
        supportType: dto.supportType || 'one_time',
        notes: dto.notes,
        completedAt: new Date()
      }
    });

    // 3. Auto-sync to Finance Ledger (Payment & FinancialAuditLog)
    await prisma.payment.create({
      data: {
        paymentNumber: receiptNo,
        paymentType: 'support',
        amount,
        currency: dto.currency || 'TZS',
        gatewayName: dto.paymentProvider || 'DPO',
        gatewayTransactionId: dto.reference || `TXN_${Date.now()}`,
        status: 'successful',
        customerEmail: dto.supporterEmail,
        customerPhone: dto.supporterPhone,
        notes: `Vision Support Contribution (${dto.tier})`
      }
    });

    await prisma.financialAuditLog.create({
      data: {
        action: 'SUPPORT_CONTRIBUTION_PAID',
        documentType: 'RECEIPT',
        documentId: contribution.id,
        documentNumber: receiptNo,
        amount,
        currency: dto.currency || 'TZS',
        description: `Supporter contribution recorded for ${dto.supporterName} (${dto.tier})`,
        performedBy: 'System Auto-Sync'
      }
    });

    // 4. Auto-sync to CRM Contact (Client) without creating duplicates
    const existingOrg = await prisma.organization.findFirst({ where: { name: 'Vision Supporters Network' } })
      || await prisma.organization.create({
        data: { name: 'Vision Supporters Network', notes: 'Community supporters and vision builders' }
      });

    const nameParts = dto.supporterName.trim().split(' ');
    const firstName = nameParts[0] || 'Supporter';
    const lastName = nameParts.slice(1).join(' ') || 'Member';

    await prisma.client.upsert({
      where: { email: dto.supporterEmail },
      update: {
        firstName,
        lastName,
        phone: dto.supporterPhone || undefined,
        role: `Vision Supporter (${dto.tier})`,
        status: 'active'
      },
      create: {
        organizationId: existingOrg.id,
        firstName,
        lastName,
        email: dto.supporterEmail,
        phone: dto.supporterPhone,
        role: `Vision Supporter (${dto.tier})`,
        status: 'active'
      }
    });

    // 5. Log Business Activity Timeline
    await prisma.businessActivity.create({
      data: {
        action: 'SUPPORTER_CONTRIBUTION',
        description: `${dto.supporterName} joined as a Vision Supporter (${dto.tier}) with ${amount} ${dto.currency || 'TZS'}`,
        performedBy: dto.supporterEmail,
        metadata: { tier: dto.tier, amount, receiptNo }
      }
    });

    return { supporter, contribution };
  }

  /**
   * Collaborators Management
   */
  async getCollaboratorsOverview() {
    const totalCollaborators = await prisma.collaboratorProfile.count();
    const activeContributors = await prisma.collaboratorProfile.count({ where: { status: 'active' } });
    const pendingInvitations = await prisma.collaboratorProfile.count({ where: { status: 'pending' } });

    const roles = ['Developer', 'Designer', 'Writer', 'Researcher', 'Volunteer', 'Advisor', 'Business Partner'];
    const roleStats: Record<string, number> = {};

    for (const r of roles) {
      roleStats[r] = await prisma.collaboratorProfile.count({ where: { roleTitle: r } });
    }

    return {
      totalCollaborators,
      activeContributors,
      pendingInvitations,
      roleStats
    };
  }

  async getCollaborators(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { roleTitle: { contains: search, mode: 'insensitive' } }
      ];
    }
    return prisma.collaboratorProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async upsertCollaborator(data: { id?: string; fullName: string; email: string; phone?: string; roleTitle: string; skills: string[]; assignedProjects?: string[]; notes?: string }) {
    return prisma.collaboratorProfile.upsert({
      where: { email: data.email },
      update: {
        fullName: data.fullName,
        phone: data.phone,
        roleTitle: data.roleTitle,
        skills: data.skills,
        assignedProjects: data.assignedProjects || [],
        notes: data.notes
      },
      create: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        roleTitle: data.roleTitle,
        skills: data.skills,
        assignedProjects: data.assignedProjects || [],
        notes: data.notes
      }
    });
  }
}

export const supportersService = new SupportersService();
