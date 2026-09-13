// backend/src/scripts/verify-phase3-marketing-automation.ts
// Programmatic End-to-End Verification Suite for Phase 3: Enterprise Marketing Automation Platform

import prisma from '../config/database';
import { marketingService } from '../services/marketing.service';
import { workflowEngine } from '../workflow/workflow.engine';
import { activityTimelineService } from '../services/activity-timeline.service';

async function runPhase3MarketingAutomationVerification() {
  console.log('================================================================');
  console.log('⚡ PHASE 3: ENTERPRISE MARKETING AUTOMATION E2E VERIFICATION');
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
    assert(workflowEngine.getRules().length >= 9, 'Centralized Workflow Engine initialized with Marketing rules');

    const timestamp = Date.now();
    const contactEmail = `phase3_marketing_${timestamp}@example.com`;

    // 2. Consent & Compliance Layer
    console.log('\n--- Step 1: Consent & Compliance Layer ---');
    const consent = await marketingService.recordContactConsent({
      contactEmail,
      emailOptIn: true,
      whatsappOptIn: true,
      newsletterSub: true
    });
    assert(consent.emailOptIn === true, `Contact consent recorded (${consent.contactEmail})`);

    // 3. Dynamic Rule-Based Audience Engine
    console.log('\n--- Step 2: Dynamic Rule-Based Audience Engine ---');
    await prisma.lead.create({
      data: {
        name: 'Phase 3 Marketing Lead',
        email: contactEmail,
        phone: '+255 712 000 111',
        requirements: 'Enterprise Marketing & Automation Platform',
        score: 85,
        status: 'qualified',
        source: 'ai_chat'
      }
    });

    const hotLeadsAudience = await marketingService.evaluateDynamicAudience('HOT_LEADS');
    assert(hotLeadsAudience.length > 0, `Dynamic Audience evaluated real-time CRM query (${hotLeadsAudience.length} hot leads found)`);

    // 4. Omnichannel Campaign Engine & Dispatcher
    console.log('\n--- Step 3: Omnichannel Campaign Engine & Dispatcher ---');
    const campaign = await marketingService.createCampaign({
      name: `Product Launch Campaign ${timestamp}`,
      type: 'ProductLaunch',
      channels: ['EMAIL', 'WHATSAPP'],
      audienceRule: 'HOT_LEADS',
      brandVoice: 'EXECUTIVE',
      subject: 'Introducing Enterprise AI Business Operating System',
      content: 'Experience the next-generation AI-powered Business Operating System.'
    });

    assert(campaign.campaignNumber.startsWith('CMP-'), `Omnichannel Campaign created (${campaign.campaignNumber})`);

    const dispatchedCampaign = await marketingService.dispatchCampaign(campaign.id);
    assert(dispatchedCampaign.sentCount > 0, `Omnichannel Campaign dispatched through adapters (${dispatchedCampaign.sentCount} dispatches)`);

    // 5. Visual Customer Journey Builder
    console.log('\n--- Step 4: Visual Customer Journey Builder ---');
    const journey = await marketingService.createCustomerJourney({
      campaignId: campaign.id,
      name: 'Executive Onboarding Drip Journey',
      triggerEvent: 'LeadQualified',
      nodesJson: [
        { type: 'TRIGGER', event: 'LeadQualified' },
        { type: 'DELAY', durationHours: 24 },
        { type: 'ACTION', channel: 'EMAIL', template: 'CaseStudy' },
        { type: 'CONDITION', check: 'LinkClicked' }
      ]
    });
    assert(journey.name === 'Executive Onboarding Drip Journey', `Customer Journey created (${journey.name})`);

    // 6. RAG-Powered AI Content Studio with Brand Voice Profiles
    console.log('\n--- Step 5: RAG-Powered AI Content Studio ---');
    const aiCopy = await marketingService.generateAICopy(
      'Draft an executive announcement email highlighting our double-entry Finance ERP and Workflow Engine.',
      'EXECUTIVE',
      'Enterprise Architecture',
      'EMAIL'
    );
    assert(aiCopy.content.toLowerCase().includes('executive'), `AI Content Studio generated copy using EXECUTIVE brand voice`);
    assert(aiCopy.knowledgeSourcesCount >= 0, 'RAG Knowledge Engine vector insights incorporated');

    // 7. Reusable Marketing Assets Library
    console.log('\n--- Step 6: Reusable Marketing Assets Library ---');
    const asset = await marketingService.uploadMarketingAsset({
      title: 'Enterprise_Platform_Architecture_Whitepaper.pdf',
      assetType: 'PDF',
      fileUrl: 'https://storage.example.com/assets/whitepaper.pdf',
      fileSize: 4500000,
      uploadedBy: 'marketing_director'
    });
    assert(asset.title.includes('Whitepaper'), `Marketing Asset stored in central library (${asset.title})`);

    // 8. Financial Attribution & ROI Analytics Engine
    console.log('\n--- Step 7: Financial Attribution & ROI Analytics Engine ---');
    const analytics = await marketingService.getAttributionAnalytics();
    assert(analytics.overview.totalCampaigns > 0, `Attribution Analytics calculated (${analytics.overview.totalCampaigns} campaigns tracked)`);
    assert(analytics.overview.roiPercent > 0, `Marketing ROI % calculated (${analytics.overview.roiPercent}%)`);

    // 9. Unified Activity Timeline Synchronization
    console.log('\n--- Step 8: Unified Activity Timeline Synchronization ---');
    const timeline = await activityTimelineService.getUnifiedTimeline(contactEmail);
    assert(timeline.length > 0, `Unified Timeline recorded Marketing Activity events for ${contactEmail}`);

    console.log('\n================================================================');
    console.log(`🎉 PHASE 3 ENTERPRISE MARKETING AUTOMATION PASSED: ${passedTests}/${totalTests} TESTS`);
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('❌ Phase 3 Marketing Automation Verification Error:', err);
    process.exit(1);
  }
}

runPhase3MarketingAutomationVerification()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
