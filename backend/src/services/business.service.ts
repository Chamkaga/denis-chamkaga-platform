// src/services/business.service.ts
// Handles CRM/ERP business domain logic: leads, organizations, clients, consultations, projects, and timelines.

import prisma from '../config/database';
import { notificationService } from './notification.service';
import { emailService } from './email.service';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcrypt';

export const businessService = {
  // ─── 1. Organization Management ────────────────────────────────────────────
  async getOrganizations() {
    return prisma.organization.findMany({
      include: { clients: true, projects: true, invoices: true },
      orderBy: { name: 'asc' }
    });
  },

  async createOrganization(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    notes?: string;
  }) {
    const org = await prisma.organization.create({
      data
    });
    
    await notificationService.logActivity({
      action: 'Organization Registered',
      description: `New organization "${org.name}" registered in database.`
    });

    return org;
  },

  async updateOrganization(id: string, data: any) {
    return prisma.organization.update({
      where: { id },
      data
    });
  },

  // ─── 2. Client / Contact Management ─────────────────────────────────────────
  async getClients(filters: { search?: string; organizationId?: string }) {
    const where: any = {};
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return prisma.client.findMany({
      where,
      include: { organization: true, user: true },
      orderBy: { lastName: 'asc' }
    });
  },

  // Create client and optionally assign a Portal user account
  async createClient(data: {
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role?: string;
    createLogin?: boolean;
    password?: string;
  }) {
    const existing = await prisma.client.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(400, 'BAD_REQUEST', 'Email is already assigned to a contact');

    let userId: string | undefined;

    if (data.createLogin) {
      if (!data.password) throw new AppError(400, 'BAD_REQUEST', 'Password is required to create a workspace login');
      
      const email = data.email.toLowerCase().trim();
      const passwordHash = await bcrypt.hash(data.password, 12);
      
      // Get or create Client Role
      const clientRole = await prisma.role.findUnique({ where: { name: 'client' } });
      if (!clientRole) throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Database roles are not fully seeded. Client role missing.');

      const user = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6),
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          roleId: clientRole.id,
          isActive: true
        }
      });
      userId = user.id;
    }

    const client = await prisma.client.create({
      data: {
        organizationId: data.organizationId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        userId
      },
      include: { organization: true }
    });

    await notificationService.logActivity({
      action: 'Client Contact Created',
      description: `Contact ${client.firstName} ${client.lastName} added under ${client.organization.name}. Portal user: ${data.createLogin ? 'Yes' : 'No'}`
    });

    return client;
  },

  // ─── 3. Lead Conversion Workflow ───────────────────────────────────────────
  async convertLeadToClient(leadId: string, data: {
    organizationName: string;
    address?: string;
    contactRole?: string;
    createLogin?: boolean;
    password?: string;
  }) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new AppError(404, 'NOT_FOUND', 'Lead not found');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: data.organizationName,
          email: lead.email,
          phone: lead.phone,
          address: data.address,
          notes: lead.notes
        }
      });

      // 2. Create Portal User (if requested)
      let userId: string | undefined;
      if (data.createLogin && lead.email) {
        if (!data.password) throw new AppError(400, 'BAD_REQUEST', 'Password is required to build a login workspace');
        const passwordHash = await bcrypt.hash(data.password, 12);
        
        const clientRole = await tx.role.findUnique({ where: { name: 'client' } });
        if (!clientRole) throw new AppError(500, 'INTERNAL_SERVER_ERROR', 'Client role is not seeded');

        const user = await tx.user.create({
          data: {
            email: lead.email.toLowerCase().trim(),
            username: lead.email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 6),
            passwordHash,
            firstName: lead.name.split(' ')[0] || lead.name,
            lastName: lead.name.split(' ').slice(1).join(' ') || 'Customer',
            roleId: clientRole.id,
            isActive: true
          }
        });
        userId = user.id;
      }

      // 3. Create Client Contact
      const client = await tx.client.create({
        data: {
          organizationId: org.id,
          firstName: lead.name.split(' ')[0] || lead.name,
          lastName: lead.name.split(' ').slice(1).join(' ') || 'Customer',
          email: lead.email || `contact_${org.id}@client.com`,
          phone: lead.phone,
          role: data.contactRole || 'Owner',
          userId
        }
      });

      // 4. Update Lead to won
      await tx.lead.update({
        where: { id: leadId },
        data: {
          status: 'won',
          convertedAt: new Date()
        }
      });

      // 5. Add Timeline activity logs
      await tx.businessActivity.create({
        data: {
          action: 'Lead Converted',
          description: `Lead "${lead.name}" converted successfully. Created company "${org.name}".`,
          performedBy: 'crm_system'
        }
      });

      return { org, client };
    });

    return result;
  },

  // ─── 4. Consultation Scheduling ────────────────────────────────────────────
  async getConsultations() {
    return prisma.consultation.findMany({
      include: { lead: true, organization: true },
      orderBy: { scheduledAt: 'desc' }
    });
  },

  async createConsultation(data: {
    leadId?: string;
    organizationId?: string;
    title: string;
    scheduledAt: Date;
    duration?: number;
    notes?: string;
    recommendations?: string;
  }) {
    const consultation = await prisma.consultation.create({
      data
    });

    await notificationService.logActivity({
      action: 'Consultation Scheduled',
      description: `Meeting "${data.title}" booked for ${new Date(data.scheduledAt).toLocaleString()}`
    });

    return consultation;
  },

  // ─── 5. Project Tracking ───────────────────────────────────────────────────
  async getProjects(filters: { search?: string; organizationId?: string }) {
    const where: any = {};
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    return prisma.project.findMany({
      where,
      include: { organization: true, createdBy: true },
      orderBy: { displayOrder: 'asc' }
    });
  },

  async updateProjectProgress(projectId: string, progressPercent: number, teamNotes: string, performedBy?: string) {
    if (progressPercent < 0 || progressPercent > 100) {
      throw new AppError(400, 'BAD_REQUEST', 'Progress must be between 0% and 100%');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        progressPercent,
        content: teamNotes ? `${teamNotes}` : undefined
      },
      include: { organization: true }
    });

    // Write Activity Timeline logs
    await notificationService.logActivity({
      action: 'Project Progress Update',
      description: `Project "${updated.title}" advanced to ${progressPercent}%: ${teamNotes || 'milestone update'}`,
      performedBy
    });

    // Notify clients who are linked to the project organization via email
    if (updated.organizationId) {
      const contacts = await prisma.client.findMany({ where: { organizationId: updated.organizationId } });
      for (const contact of contacts) {
        // Asynchronously send status email
        emailService.sendProjectUpdate(contact.email, `${contact.firstName} ${contact.lastName}`, updated.title, progressPercent, teamNotes)
          .catch((err: any) => console.error('Failed to notify project contact:', err));
      }
    }

    return updated;
  },

  /**
   * Convert Approved Quotation into Automated Project Workspace
   */
  async convertQuotationToProject(quotationId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { organization: true, items: true }
    });

    if (!quotation) {
      throw new AppError(404, 'NOT_FOUND', `Quotation ${quotationId} not found.`);
    }

    const title = quotation.title || `Project - ${quotation.quotationNumber}`;
    const slug = `${quotation.quotationNumber.toLowerCase()}-${Date.now()}`;

    let adminUser = await prisma.user.findFirst();
    if (!adminUser) {
      const defaultRole = await prisma.role.findFirst() || await prisma.role.create({ data: { name: 'admin', description: 'System Admin' } });
      adminUser = await prisma.user.create({
        data: {
          email: `admin_${Date.now()}@denischamkaga.com`,
          username: `admin_${Date.now()}`,
          passwordHash: 'dummy_hash',
          firstName: 'System',
          lastName: 'Admin',
          roleId: defaultRole.id
        }
      });
    }

    // Create Project Workspace
    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description: `Automated Project Workspace initialized from approved Quotation ${quotation.quotationNumber}.`,
        organizationId: quotation.organizationId,
        category: 'Enterprise Software',
        status: 'in_progress',
        progressPercent: 10,
        content: `## Project Milestones & Workspace Details\n\n- **Inception & Architecture**: Setup & Environment Config\n- **UI/UX Design**: Wireframes & Design Tokens\n- **Core Development**: API & Backend Integration\n- **QA & Testing**: E2E Verification\n- **Deployment & Handover**: Production Launch\n\n### Quotation Items:\n${quotation.items.map(i => `- ${i.description} (Qty: ${i.quantity}, Price: ${i.unitPrice} TZS)`).join('\n')}`,
        displayOrder: 1,
        techStack: ['TypeScript', 'Node.js', 'PostgreSQL', 'AI Engine'],
        createdById: adminUser.id
      }
    });

    // Mark Quotation as Accepted
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'ACCEPTED' }
    });

    // Log Activity
    await notificationService.logActivity({
      action: 'Quotation Converted to Project Workspace',
      description: `Quotation ${quotation.quotationNumber} accepted. Project Workspace '${project.title}' initialized.`
    });

    return project;
  },

  // ─── 6. Contracts Management ────────────────────────────────────────────────
  async getContracts(filters: { organizationId?: string }) {
    const where: any = {};
    if (filters.organizationId) where.organizationId = filters.organizationId;
    return prisma.contract.findMany({
      where,
      include: { organization: true, project: true, attachment: true },
      orderBy: { startDate: 'desc' }
    });
  },

  async createContract(data: {
    title: string;
    organizationId: string;
    projectId?: string;
    startDate: Date;
    endDate?: Date;
    value?: number;
    currency?: string;
    notes?: string;
    attachmentId?: string; // DigitalAsset ID
  }) {
    const contractNumber = 'CON-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        title: data.title,
        organizationId: data.organizationId,
        projectId: data.projectId,
        startDate: data.startDate,
        endDate: data.endDate,
        value: data.value,
        currency: data.currency || 'USD',
        notes: data.notes,
        attachmentId: data.attachmentId
      },
      include: { organization: true, attachment: true }
    });

    await notificationService.logActivity({
      action: 'Contract Signed',
      description: `Contract "${contract.title}" registered for company ${contract.organization.name}. Code: ${contract.contractNumber}`
    });

    return contract;
  },

  // ─── 7. Document Sharing ───────────────────────────────────────────────────
  async getSharedDocuments(filters: { clientId?: string; organizationId?: string }) {
    const where: any = {};
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.organizationId) {
      where.client = { organizationId: filters.organizationId };
    }
    return prisma.sharedDocument.findMany({
      where,
      include: { client: true, asset: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async shareDocument(data: {
    title: string;
    description?: string;
    clientId: string;
    assetId: string;
  }) {
    const doc = await prisma.sharedDocument.create({
      data,
      include: { client: { include: { organization: true } } }
    });

    await notificationService.logActivity({
      action: 'Document Uploaded',
      description: `File "${doc.title}" shared with ${doc.client.firstName} ${doc.client.lastName} (${doc.client.organization.name})`
    });

    return doc;
  },

  // Retrieve chronological timeline activities (Unified Timeline)
  async getTimeline() {
    const activities = await prisma.businessActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40
    });

    const calls = await prisma.callSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { lead: true }
    });

    const chats = await prisma.chatSession.findMany({
      orderBy: { startedAt: 'desc' },
      take: 30,
      include: { lead: true }
    });

    const timelineEvents = [
      ...activities.map(act => ({
        id: act.id,
        createdAt: act.createdAt,
        action: act.action,
        description: act.description,
        performedBy: act.performedBy || 'system'
      })),
      ...calls.map(call => ({
        id: call.id,
        createdAt: call.createdAt,
        action: 'Voice Call Completed',
        description: `Call with "${call.callerName}" lasted ${Math.floor(call.durationSec / 60)}m ${call.durationSec % 60}s. Status: ${call.status}. Next Action: ${call.nextAction || 'None'}.`,
        performedBy: 'Denis'
      })),
      ...chats.map(chat => ({
        id: chat.id,
        createdAt: chat.startedAt,
        action: 'AI Chat Started',
        description: `Visitor "${chat.lead?.name || 'Explorer'}" started an AI chat. Lead Score: ${chat.leadScore}%.`,
        performedBy: 'visitor'
      }))
    ];

    // Sort descending by date
    return timelineEvents
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100);
  }
};
