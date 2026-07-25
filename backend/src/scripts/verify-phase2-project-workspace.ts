// backend/src/scripts/verify-phase2-project-workspace.ts
// Programmatic End-to-End Verification Suite for Phase 2: Advanced Project Workspace

import prisma from '../config/database';
import { projectWorkspaceService } from '../services/project-workspace.service';
import { businessService } from '../services/business.service';
import { financeService } from '../services/finance.service';
import { workflowEngine } from '../workflow/workflow.engine';
import { aiEventBus } from '../ai/event-bus';
import { activityTimelineService } from '../services/activity-timeline.service';
import { adminService } from '../services/admin.service';

async function runPhase2ProjectWorkspaceVerification() {
  console.log('================================================================');
  console.log('⚡ PHASE 2: ADVANCED PROJECT WORKSPACE E2E VERIFICATION');
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
      throw new Error(`Verification Failed: ${description}`);
    }
  };

  try {
    // 1. Initialize Centralized Workflow Engine
    workflowEngine.initialize();
    assert(workflowEngine.getRules().length >= 8, 'Centralized Workflow Engine initialized with Project Workspace rules');

    // 2. Service Templates Initialization
    console.log('\n--- Step 1: Service Templates Initialization ---');
    const templates = await projectWorkspaceService.getTemplates();
    assert(templates.length >= 2, `Service Templates initialized (${templates.length} templates available)`);

    const timestamp = Date.now();
    const clientEmail = `phase2_workspace_${timestamp}@example.com`;
    const org = await businessService.createOrganization({
      name: 'Phase 2 Enterprise Client',
      email: clientEmail,
      phone: '+255 755 999 888'
    });

    // 3. Quotation Creation & Approval -> Instant Workspace Auto-Creation
    console.log('\n--- Step 2: Quotation Approval -> Instant Project Workspace Creation ---');
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QT-PHASE2-${timestamp}`,
        organizationId: org.id,
        title: 'Phase 2 Custom ERP & AI Infrastructure',
        subtotal: 45000000,
        total: 45000000,
        status: 'APPROVED',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });

    const workspaceDetails = await projectWorkspaceService.createProjectFromQuotation(quotation.id, 'Custom ERP & AI Infrastructure');
    const project = workspaceDetails.project;

    assert(project !== null, `Automated Project Workspace created (ID: ${project.id})`);
    assert(project.workspaceMilestones.length >= 2, `Template milestones auto-generated (${project.workspaceMilestones.length} milestones)`);
    assert(project.workspaceTasks.length >= 4, `Template tasks auto-generated (${project.workspaceTasks.length} tasks)`);

    // 4. Task Completion & Milestone Progress Recalculation
    console.log('\n--- Step 3: Task Completion & Milestone Progress Recalculation ---');
    const firstTask = project.workspaceTasks[0];
    await projectWorkspaceService.updateTaskStatus(firstTask.id, 'done', 8);

    const updatedWorkspace = await projectWorkspaceService.getWorkspaceDetails(project.id);
    assert(updatedWorkspace.project.progressPercent > 0, `Project overall progress auto-updated to ${updatedWorkspace.project.progressPercent}%`);

    // 5. Time Tracking & Billable Hours Logging
    console.log('\n--- Step 4: Time Tracking & Collaborator Log ---');
    const secondTask = project.workspaceTasks[1];
    const timeLog = await projectWorkspaceService.logTime(secondTask.id, 'lead_developer@example.com', 5, 'Configured RAG Vector Pipeline');
    assert(Number(timeLog.hours) === 5, 'Time tracking log recorded');

    // 6. DAM Asset File Upload & Versioning
    console.log('\n--- Step 5: DAM Digital Asset File Upload & Versioning ---');
    const assetFile = await projectWorkspaceService.uploadAssetFile({
      projectId: project.id,
      taskId: firstTask.id,
      fileName: 'Architecture_Blueprint_v1.pdf',
      fileUrl: 'https://storage.example.com/blueprints/v1.pdf',
      fileType: 'PDF',
      uploadedBy: 'system_architect'
    });

    assert(assetFile.fileName === 'Architecture_Blueprint_v1.pdf', `Asset file uploaded (${assetFile.fileName}, version ${assetFile.version})`);

    // 7. AI Project Assistant RAG Status Summary & Risk Analysis
    console.log('\n--- Step 6: AI Project Assistant Status Summary & Risk Analysis ---');
    const aiSummary = await projectWorkspaceService.generateAIProjectSummary(project.id);
    assert(aiSummary !== null && aiSummary.statusSummary.length > 0, 'AI Project Assistant status summary generated');
    assert(aiSummary?.riskLevel !== undefined, `AI Risk Level evaluated: ${aiSummary?.riskLevel}`);

    // 8. Finance ERP Integration (Profitability)
    console.log('\n--- Step 7: Finance ERP Profitability Integration ---');
    await financeService.createBusinessExpense({
      category: 'Infrastructure',
      vendor: 'HuggingFace Inference Endpoints',
      description: 'Dedicated GPU Models for Project Workspace RAG',
      amount: 2500000,
      currency: 'TZS',
      projectId: project.id
    });

    const finSummary = await financeService.getProjectFinancialSummary(project.id);
    assert(finSummary !== null && finSummary.actualCost === 2500000, `Finance ERP actual cost synchronized (${finSummary?.actualCost.toLocaleString()} TZS)`);

    // 9. Unified Activity Timeline & CRM Integration
    console.log('\n--- Step 8: Unified Activity Timeline & CRM Integration ---');
    const timeline = await activityTimelineService.getUnifiedTimeline(clientEmail);
    assert(timeline.length > 0, `Unified Activity Timeline retrieved ${timeline.length} events for ${clientEmail}`);

    // 10. Console Dashboard Metrics Integration
    console.log('\n--- Step 9: Console Dashboard Project Metrics ---');
    const stats = await adminService.getDashboardStats();
    assert(stats.projects.total > 0, `Dashboard live active projects metric verified (${stats.projects.total})`);

    console.log('\n================================================================');
    console.log(`🎉 PHASE 2 ADVANCED PROJECT WORKSPACE E2E PASSED: ${passedTests}/${totalTests} TESTS`);
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('❌ Phase 2 Project Workspace Verification Error:', err);
    process.exit(1);
  }
}

runPhase2ProjectWorkspaceVerification();
