// backend/src/services/project-workspace.service.ts
// Phase 2: Advanced Project Workspace Engine Service

import prisma from '../config/database';
import { aiEventBus } from '../ai/event-bus';
import { financeService } from './finance.service';
import { AppError } from '../middleware/errorHandler';

export const projectWorkspaceService = {
  // ─── 1. Seed Reusable Service Templates ──────────────────────────────────
  async seedDefaultTemplates() {
    const templates = [
      {
        name: 'Website Development',
        category: 'Development',
        description: 'End-to-end web software development template',
        isDefault: true,
        milestones: [
          {
            title: 'Phase 1: Inception & UI/UX Design',
            durationDays: 7,
            orderIndex: 0,
            tasks: [
              { title: 'Requirements Gathering & Scope Finalization', estimatedHours: 8, department: 'Design' },
              { title: 'Figma Wireframes & Design System', estimatedHours: 16, department: 'Design' }
            ]
          },
          {
            title: 'Phase 2: Frontend & Backend Implementation',
            durationDays: 14,
            orderIndex: 1,
            tasks: [
              { title: 'Core Layout & Responsive Component Library', estimatedHours: 24, department: 'Engineering' },
              { title: 'REST API & Database Models Integration', estimatedHours: 24, department: 'Engineering' }
            ]
          },
          {
            title: 'Phase 3: QA, Deployment & Client Handover',
            durationDays: 5,
            orderIndex: 2,
            tasks: [
              { title: 'E2E Testing & Performance Audit', estimatedHours: 12, department: 'QA' },
              { title: 'Production Deployment & Admin Training', estimatedHours: 8, department: 'Operations' }
            ]
          }
        ]
      },
      {
        name: 'Custom ERP & AI Infrastructure',
        category: 'AI Infrastructure',
        description: 'Enterprise ERP, AI Orchestrator & Workflow Engine template',
        isDefault: false,
        milestones: [
          {
            title: 'Phase 1: Architecture & Data Modeling',
            durationDays: 10,
            orderIndex: 0,
            tasks: [
              { title: 'PostgreSQL Schema & Event Bus Setup', estimatedHours: 20, department: 'Engineering' },
              { title: 'RAG Knowledge Engine Vector Pipeline', estimatedHours: 20, department: 'AI' }
            ]
          },
          {
            title: 'Phase 2: Business Operating System & Workflows',
            durationDays: 20,
            orderIndex: 1,
            tasks: [
              { title: 'Centralized Workflow Engine & Rules', estimatedHours: 30, department: 'Engineering' },
              { title: 'Double-Entry Finance ERP Integration', estimatedHours: 30, department: 'Engineering' }
            ]
          }
        ]
      }
    ];

    for (const t of templates) {
      const existing = await prisma.projectTemplate.findUnique({ where: { name: t.name } });
      if (!existing) {
        const createdTmpl = await prisma.projectTemplate.create({
          data: {
            name: t.name,
            category: t.category,
            description: t.description,
            isDefault: t.isDefault
          }
        });

        for (const m of t.milestones) {
          const createdMilestone = await prisma.projectMilestoneTemplate.create({
            data: {
              templateId: createdTmpl.id,
              title: m.title,
              durationDays: m.durationDays,
              orderIndex: m.orderIndex
            }
          });

          for (const task of m.tasks) {
            await prisma.projectTaskTemplate.create({
              data: {
                milestoneTemplateId: createdMilestone.id,
                title: task.title,
                estimatedHours: task.estimatedHours,
                department: task.department
              }
            });
          }
        }
      }
    }
  },

  async getTemplates() {
    await this.seedDefaultTemplates();
    return prisma.projectTemplate.findMany({
      include: {
        milestones: {
          include: { tasks: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  },

  // ─── 2. Quote-to-Project Workspace Auto-Creation ──────────────────────────
  async createProjectFromQuotation(quotationId: string, templateName?: string) {
    await this.seedDefaultTemplates();

    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true, organization: true }
    });

    if (!quotation) {
      throw new AppError(404, 'NOT_FOUND', 'Quotation not found');
    }

    // Check if project workspace already exists for this quotation
    const existingProject = await prisma.project.findFirst({
      where: { quotations: { some: { id: quotationId } } }
    });

    if (existingProject) {
      return this.getWorkspaceDetails(existingProject.id);
    }

    // Select template
    const template = templateName
      ? await prisma.projectTemplate.findUnique({ where: { name: templateName }, include: { milestones: { include: { tasks: true } } } })
      : await prisma.projectTemplate.findFirst({ where: { isDefault: true }, include: { milestones: { include: { tasks: true } } } });

    const adminUser = await prisma.user.findFirst();
    if (!adminUser) throw new AppError(500, 'SERVER_ERROR', 'Default admin user not configured');

    const slug = `workspace-${quotation.quotationNumber.toLowerCase()}-${Date.now()}`;

    // Create Project record
    const project = await prisma.project.create({
      data: {
        title: quotation.title,
        slug,
        description: `Automated Project Workspace for ${quotation.organization.name}. ${quotation.notes || ''}`,
        content: `Project Scope:\n${quotation.items.map((i) => `- ${i.description} (Qty: ${i.quantity})`).join('\n')}`,
        category: template?.category || 'Development',
        status: 'in_progress',
        progressPercent: 0,
        budget: quotation.total,
        organizationId: quotation.organizationId,
        createdById: adminUser.id,
        techStack: ['Node.js', 'PostgreSQL', 'TypeScript', 'React'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Link Quotation to Project
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { projectId: project.id }
    });

    // Generate Milestones & Tasks from Template
    if (template) {
      let now = new Date();
      for (const mTmpl of template.milestones) {
        const endDate = new Date(now.getTime() + mTmpl.durationDays * 24 * 60 * 60 * 1000);
        const milestone = await prisma.projectMilestone.create({
          data: {
            projectId: project.id,
            title: mTmpl.title,
            orderIndex: mTmpl.orderIndex,
            status: mTmpl.orderIndex === 0 ? 'in_progress' : 'planned',
            plannedStart: now,
            plannedEnd: endDate,
            ownerName: quotation.organization.name
          }
        });

        for (const tTmpl of mTmpl.tasks) {
          await prisma.projectTask.create({
            data: {
              projectId: project.id,
              milestoneId: milestone.id,
              title: tTmpl.title,
              estimatedHours: tTmpl.estimatedHours,
              department: tTmpl.department,
              status: 'todo',
              assignedToEmail: quotation.organization.email
            }
          });
        }

        now = endDate;
      }
    }

    // Log Business Activity on Unified Timeline
    await prisma.businessActivity.create({
      data: {
        action: 'PROJECT_WORKSPACE_INITIALIZED',
        description: `Project Workspace initialized automatically for approved Quotation ${quotation.quotationNumber}. Client: ${quotation.organization.name}.`,
        performedBy: 'WorkflowEngine'
      }
    });

    return this.getWorkspaceDetails(project.id);
  },

  // ─── 3. Complete Workspace Details & Aggregations ─────────────────────────
  async getWorkspaceDetails(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        invoices: true,
        quotations: true,
        workspaceMilestones: {
          include: { tasks: { include: { timeLogs: true, files: true } } },
          orderBy: { orderIndex: 'asc' }
        },
        workspaceTasks: {
          include: { timeLogs: true, files: true },
          orderBy: { createdAt: 'desc' }
        },
        assetFiles: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    const financialSummary = await financeService.getProjectFinancialSummary(project.id);
    const aiSummary = await this.generateAIProjectSummary(project.id);

    return {
      project,
      financialSummary,
      aiSummary
    };
  },

  // ─── 4. Task Management & Completion Recalculations ────────────────────────
  async updateTaskStatus(taskId: string, status: string, actualHours?: number) {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: { milestone: true }
    });

    if (!task) throw new AppError(404, 'NOT_FOUND', 'Task not found');

    const completionPct = status === 'done' ? 100 : status === 'in_progress' ? 50 : 0;

    const updatedTask = await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        status,
        completionPct,
        actualHours: actualHours !== undefined ? actualHours : task.actualHours
      }
    });

    // Recalculate Milestone progress
    if (task.milestoneId) {
      const milestoneTasks = await prisma.projectTask.findMany({ where: { milestoneId: task.milestoneId } });
      const totalPct = milestoneTasks.reduce((sum, t) => sum + Number(t.completionPct), 0);
      const avgMilestonePct = milestoneTasks.length > 0 ? totalPct / milestoneTasks.length : 0;

      const milestoneStatus = avgMilestonePct >= 100 ? 'completed' : avgMilestonePct > 0 ? 'in_progress' : 'planned';

      await prisma.projectMilestone.update({
        where: { id: task.milestoneId },
        data: {
          completionPct: avgMilestonePct,
          status: milestoneStatus,
          actualEnd: avgMilestonePct >= 100 ? new Date() : undefined
        }
      });

      if (milestoneStatus === 'completed') {
        aiEventBus.publish('MilestoneCompleted', {
          projectId: task.projectId,
          milestoneId: task.milestoneId,
          milestoneTitle: task.milestone?.title
        });
      }
    }

    // Recalculate Project overall progressPercent
    const allTasks = await prisma.projectTask.findMany({ where: { projectId: task.projectId } });
    const totalProjectPct = allTasks.reduce((sum, t) => sum + Number(t.completionPct), 0);
    const projectProgressPercent = allTasks.length > 0 ? Math.round(totalProjectPct / allTasks.length) : 0;

    await prisma.project.update({
      where: { id: task.projectId },
      data: { progressPercent: projectProgressPercent }
    });

    if (status === 'done') {
      aiEventBus.publish('TaskCompleted', {
        taskId: task.id,
        projectId: task.projectId,
        taskTitle: task.title
      });
    }

    return updatedTask;
  },

  // ─── 5. Time Tracking ──────────────────────────────────────────────────────
  async logTime(taskId: string, loggedBy: string, hours: number, description?: string) {
    const task = await prisma.projectTask.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError(404, 'NOT_FOUND', 'Task not found');

    const log = await prisma.projectTimeLog.create({
      data: {
        taskId,
        loggedBy,
        hours,
        description
      }
    });

    await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        actualHours: { increment: hours },
        billableHours: { increment: hours }
      }
    });

    return log;
  },

  // ─── 6. DAM Asset File Upload ──────────────────────────────────────────────
  async uploadAssetFile(data: {
    projectId: string;
    taskId?: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    uploadedBy: string;
    visibility?: 'internal' | 'client_visible';
  }) {
    const existingCount = await prisma.projectAssetFile.count({
      where: { projectId: data.projectId, fileName: data.fileName }
    });

    const file = await prisma.projectAssetFile.create({
      data: {
        projectId: data.projectId,
        taskId: data.taskId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        version: existingCount + 1,
        uploadedBy: data.uploadedBy,
        visibility: data.visibility || 'internal'
      }
    });

    aiEventBus.publish('FileUploaded', {
      projectId: data.projectId,
      fileName: data.fileName,
      uploadedBy: data.uploadedBy
    });

    return file;
  },

  // ─── 7. AI Project Assistant RAG Summary & Risk Detection ──────────────────
  async generateAIProjectSummary(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspaceMilestones: { include: { tasks: true } },
        workspaceTasks: true,
        assetFiles: true
      }
    });

    if (!project) return null;

    const totalTasks = project.workspaceTasks.length;
    const completedTasks = project.workspaceTasks.filter((t) => t.status === 'done').length;
    const highRiskMilestones = project.workspaceMilestones.filter((m) => m.riskLevel === 'high' || m.status === 'delayed');

    const statusSummary = `Project is ${project.progressPercent}% complete (${completedTasks}/${totalTasks} tasks finished).`;
    const riskLevel = highRiskMilestones.length > 0 ? 'High' : project.progressPercent < 30 ? 'Medium' : 'Low';
    const blockers = highRiskMilestones.map((m) => m.title);

    const recommendedNextActions = project.workspaceTasks
      .filter((t) => t.status === 'todo')
      .slice(0, 3)
      .map((t) => `Complete task: ${t.title} (${t.department})`);

    return {
      projectId,
      projectTitle: project.title,
      progressPercent: project.progressPercent,
      statusSummary,
      riskLevel,
      blockers,
      recommendedNextActions,
      aiTimestamp: new Date().toISOString()
    };
  }
};
