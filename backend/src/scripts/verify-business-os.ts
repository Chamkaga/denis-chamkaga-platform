// backend/src/scripts/verify-business-os.ts
// Enterprise AI Business Operating System & Workflow Engine Verification Script

import prisma from '../config/database';
import { aiEventBus } from '../ai/event-bus';
import { workflowEngine } from '../workflow/workflow.engine';
import { businessService } from '../services/business.service';
import { financeService } from '../services/finance.service';
import { activityTimelineService } from '../services/activity-timeline.service';

async function runBusinessOSVerification() {
  console.log('================================================================');
  console.log('⚡ ENTERPRISE AI BUSINESS OPERATING SYSTEM E2E VERIFICATION');
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
    // 1. Initialize Workflow Engine
    workflowEngine.initialize();
    assert(workflowEngine.getRules().length > 0, 'Centralized Workflow Engine initialized with rules');

    const testEmail = `enterprise_${Date.now()}@example.com`;
    const testName = 'Mwita Mwita';
    const testPhone = '+255 768 990 011';

    // 2. Test Event-Driven Lead Qualification Workflow
    console.log('\nStep 2: Simulating AI Lead Qualification & Event Publication...');
    aiEventBus.publish('LeadQualified', {
      leadId: `lead_${Date.now()}`,
      name: testName,
      email: testEmail,
      phone: testPhone,
      service: 'Custom ERP & AI Infrastructure',
      budget: '45,000,000 TZS',
      score: 85,
      urgency: 'high',
      temperature: 'hot'
    });

    // Brief delay for async event handlers
    await new Promise((r) => setTimeout(r, 400));

    const highPriorityLog = await prisma.businessActivity.findFirst({
      where: { action: 'WORKFLOW_HIGH_PRIORITY_LEAD', performedBy: 'WorkflowEngine' },
      orderBy: { createdAt: 'desc' }
    });
    assert(highPriorityLog !== null, 'WorkflowEngine automatically escalated Lead Score 85 > 70 and logged activity');

    // 3. Test Incoming Call Intelligence & After-Call AI Assistant
    console.log('\nStep 3: Simulating Voice Call Session & After-Call Automation...');
    const callSession = await prisma.callSession.create({
      data: {
        sessionId: `SESSION_${Date.now()}`,
        callerName: testName,
        receiverName: 'Denis Chamkaga',
        status: 'completed',
        durationSec: 320,
        customerBrief: {
          email: testEmail,
          requestedService: 'Custom ERP & AI Infrastructure',
          leadScore: 85,
          budget: '45,000,000 TZS',
          urgency: 'high',
          recommendedAction: 'Prepare Quotation and Proposal Contract'
        }
      }
    });

    aiEventBus.publish('VoiceCallSummaryGenerated', {
      sessionId: callSession.sessionId,
      callSessionId: callSession.id,
      summary: 'Client agreed to proceed with phase 1 implementation.',
      rawNotes: '1. Send quotation for 45M TZS. 2. Schedule architecture review.',
      actionItems: '1. Send quotation for 45M TZS. 2. Schedule architecture review.',
      sentiment: 'positive',
      leadScore: 85
    });

    await new Promise((r) => setTimeout(r, 400));

    const callLog = await prisma.businessActivity.findFirst({
      where: { action: 'WORKFLOW_AFTER_CALL_LOGGED' },
      orderBy: { createdAt: 'desc' }
    });
    assert(callLog !== null, 'After-Call automation captured meeting notes and updated CRM activity timeline');

    // 4. Test Quotation Approval -> Automated Project Workspace Creation
    console.log('\nStep 4: Testing Quotation Approval -> Automated Project Workspace Workflow...');
    const org = await businessService.createOrganization({
      name: 'Mwita Enterprise Solutions',
      email: testEmail,
      phone: testPhone
    });

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QUO_${Date.now()}`,
        organizationId: org.id,
        title: 'Enterprise AI Operating System Implementation',
        subtotal: 45000000,
        total: 45000000,
        status: 'SENT',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            { description: 'Core Workflow Engine & AI Bus', quantity: 1, unitPrice: 20000000, subtotal: 20000000 },
            { description: 'CRM & Project Workspace Integration', quantity: 1, unitPrice: 25000000, subtotal: 25000000 }
          ]
        }
      }
    });

    aiEventBus.publish('QuotationApproved', {
      quotationId: quotation.id
    });

    await new Promise((r) => setTimeout(r, 500));

    const project = await prisma.project.findFirst({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'desc' }
    });

    assert(project !== null, `Automated Project Workspace created from Quotation (ID: ${project?.id})`);
    assert(project?.title === quotation.title, 'Project Workspace title matches approved quotation title');

    // 5. Test Unified Contact Activity Timeline
    console.log('\nStep 5: Testing Unified Relationship Timeline Retrieval...');
    const timeline = await activityTimelineService.getUnifiedTimeline(testEmail);
    assert(timeline.length > 0, `Unified Timeline retrieved ${timeline.length} operational history events for ${testEmail}`);

    console.log('\n================================================================');
    console.log(`🎉 ENTERPRISE BUSINESS OPERATING SYSTEM VERIFICATION PASSED: ${passedTests}/${totalTests} TESTS`);
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('❌ Operating System Verification Failed:', err);
    process.exit(1);
  }
}

runBusinessOSVerification();
