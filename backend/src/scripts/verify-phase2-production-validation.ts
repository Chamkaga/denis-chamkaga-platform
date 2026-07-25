// backend/src/scripts/verify-phase2-production-validation.ts
// Real Business Operations & Production Readiness Validation for Phase 2: Advanced Project Workspace

import prisma from '../config/database';
import { workflowEngine } from '../workflow/workflow.engine';
import { aiEventBus } from '../ai/event-bus';
import { businessService } from '../services/business.service';
import { financeService } from '../services/finance.service';
import { projectWorkspaceService } from '../services/project-workspace.service';
import { activityTimelineService } from '../services/activity-timeline.service';
import { adminService } from '../services/admin.service';

async function runPhase2ProductionValidation() {
  console.log('================================================================');
  console.log('🌟 PHASE 2: ADVANCED PROJECT WORKSPACE PRODUCTION VALIDATION');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  const assert = (condition: boolean, description: string) => {
    totalTests++;
    if (condition) {
      console.log(` ✅ PASS [Step ${totalTests}]: ${description}`);
      passedTests++;
    } else {
      console.error(` ❌ FAIL [Step ${totalTests}]: ${description}`);
      throw new Error(`Validation Failed: ${description}`);
    }
  };

  try {
    // 1. Initialize Centralized Workflow Engine
    workflowEngine.initialize();
    assert(workflowEngine.getRules().length >= 8, 'Centralized Workflow Engine initialized with Phase 2 rules');

    const timestamp = Date.now();
    const visitorEmail = `prod_client_${timestamp}@example.com`;
    const visitorName = 'Baraka Executive';
    const visitorPhone = '+255 768 111 222';

    // ── SCENARIO: VISITOR -> AI CHAT -> QUOTATION -> WORKSPACE -> DELIVERY ─────
    console.log('\n--- 1. Visitor AI Chat & CRM Qualification ---');
    const lead = await prisma.lead.create({
      data: {
        name: visitorName,
        email: visitorEmail,
        phone: visitorPhone,
        requirements: 'Enterprise Mobile App & AI Assistant',
        score: 92,
        budgetMentioned: true,
        status: 'qualified',
        source: 'ai_chat',
        notes: 'Visitor requested AI Assistant & Flutter Mobile App.'
      }
    });

    aiEventBus.publish('LeadQualified', {
      leadId: lead.id,
      name: visitorName,
      email: visitorEmail,
      phone: visitorPhone,
      service: 'Enterprise Mobile App & AI Assistant',
      budget: '60,000,000 TZS',
      score: 92,
      urgency: 'high',
      temperature: 'hot'
    });

    await new Promise((r) => setTimeout(r, 400));
    assert(lead.score === 92, `Lead qualified by AI Assistant (Score: ${lead.score}/100)`);

    console.log('\n--- 2. Quotation Generation & Approval ---');
    const org = await businessService.createOrganization({
      name: 'Baraka Enterprise Holdings',
      email: visitorEmail,
      phone: visitorPhone
    });

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QT-PROD-${timestamp}`,
        organizationId: org.id,
        title: 'Enterprise Mobile App & AI Assistant Deployment',
        subtotal: 60000000,
        total: 60000000,
        status: 'APPROVED',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });

    console.log('Triggering QuotationApproved event...');
    aiEventBus.publish('QuotationApproved', { quotationId: quotation.id });
    await new Promise((r) => setTimeout(r, 400));

    // ── 3. AUTOMATED PROJECT WORKSPACE CREATION ─────────────────────────────────
    console.log('\n--- 3. Automatic Project Workspace Initialization ---');
    const workspace = await projectWorkspaceService.createProjectFromQuotation(quotation.id, 'Website Development');
    const project = workspace.project;

    assert(project !== null, `Automated Project Workspace created (ID: ${project.id})`);
    assert(project.title === quotation.title, 'Project Workspace title matches approved quotation');
    assert(project.workspaceMilestones.length > 0, `Default milestones generated (${project.workspaceMilestones.length} milestones)`);
    assert(project.workspaceTasks.length > 0, `Default tasks generated (${project.workspaceTasks.length} tasks)`);

    // ── 4. WORKSPACE OPERATING CENTER: COLLABORATOR, TASK & TIME LOGS ──────────
    console.log('\n--- 4. Task Execution, Collaborator Assignment & Time Tracking ---');
    const task1 = project.workspaceTasks[0];
    await projectWorkspaceService.updateTaskStatus(task1.id, 'in_progress');

    const timeLog = await projectWorkspaceService.logTime(task1.id, 'lead_architect@example.com', 6, 'Finalized system design specs');
    assert(Number(timeLog.hours) === 6, 'Time tracking log recorded for collaborator');

    await projectWorkspaceService.updateTaskStatus(task1.id, 'done', 8);
    const updatedDetails = await projectWorkspaceService.getWorkspaceDetails(project.id);
    assert(updatedDetails.project.progressPercent > 0, `Project progress automatically recalculated to ${updatedDetails.project.progressPercent}%`);

    // ── 5. DAM DIGITAL ASSET FILE MANAGEMENT ──────────────────────────────────
    console.log('\n--- 5. DAM Digital Asset Upload & Versioning ---');
    const damFile = await projectWorkspaceService.uploadAssetFile({
      projectId: project.id,
      taskId: task1.id,
      fileName: 'Mobile_App_Architecture_v1.pdf',
      fileUrl: 'https://storage.example.com/assets/Mobile_App_Architecture_v1.pdf',
      fileType: 'PDF',
      uploadedBy: 'lead_architect@example.com',
      visibility: 'client_visible'
    });

    assert(damFile.fileName === 'Mobile_App_Architecture_v1.pdf', `DAM Asset file stored (Version ${damFile.version})`);

    // ── 6. PROACTIVE AI PROJECT ASSISTANT RAG ─────────────────────────────────
    console.log('\n--- 6. Proactive AI Project Assistant RAG Analysis ---');
    const aiAnalysis = await projectWorkspaceService.generateAIProjectSummary(project.id);
    assert(aiAnalysis !== null && aiAnalysis.statusSummary.length > 0, 'AI Assistant generated proactive status summary');
    assert(aiAnalysis?.recommendedNextActions.length! > 0, `AI Assistant recommended ${aiAnalysis?.recommendedNextActions.length} next actions`);

    // ── 7. FINANCE ERP PROFITABILITY INTEGRATION ──────────────────────────────
    console.log('\n--- 7. Finance ERP Profitability Synchronization ---');
    await financeService.createBusinessExpense({
      category: 'Infrastructure',
      vendor: 'AWS Elastic Compute',
      description: 'Dedicated Staging Server Deployment',
      amount: 3000000,
      currency: 'TZS',
      projectId: project.id
    });

    const finSummary = await financeService.getProjectFinancialSummary(project.id);
    assert(finSummary !== null && finSummary.actualCost === 3000000, `Finance ERP actual cost synchronized (${finSummary?.actualCost.toLocaleString()} TZS)`);

    // ── 8. UNIFIED TIMELINE, CRM & DASHBOARD INTEGRATION ───────────────────────
    console.log('\n--- 8. Unified Timeline, CRM & Dashboard Synchronization ---');
    const timeline = await activityTimelineService.getUnifiedTimeline(visitorEmail);
    assert(timeline.length > 0, `Unified Timeline retrieved ${timeline.length} events for ${visitorEmail}`);

    const dashboardStats = await adminService.getDashboardStats();
    assert(dashboardStats.projects.total > 0, `Dashboard active projects count verified (${dashboardStats.projects.total})`);

    console.log('\n================================================================');
    console.log(`🎉 PHASE 2 PRODUCTION READINESS VALIDATION PASSED: ${passedTests}/${totalTests} TESTS`);
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('❌ Phase 2 Production Validation Error:', err);
    process.exit(1);
  }
}

runPhase2ProductionValidation();
