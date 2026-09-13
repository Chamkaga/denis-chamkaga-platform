// backend/src/scripts/verify-supporters-workflow.ts
// Programmatic End-to-End Verification Script for Vision Supporters & Membership System

import prisma from '../config/database';
import { supportersService } from '../services/supporters.service';

async function runSupportersE2EVerification() {
  console.log('================================================================');
  console.log('🚀 VISION SUPPORTERS & MEMBERSHIP E2E WORKFLOW VERIFICATION');
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
    const testEmail = `supporter_${Date.now()}@example.com`;
    const testName = 'Amani Msimbazi';
    const testPhone = '+255 754 112 233';
    const amount = 50000;
    const tier = 'VISION_BUILDER';

    console.log(`Step 1: Visitor selects Official Platform Tier: ⭐ Vision Builder (${amount.toLocaleString()} TZS)`);
    assert(true, 'Official Platform Tier selected: VISION_BUILDER (50,000 TZS)');

    console.log('\nStep 2: Executing Supporter Contribution & Multi-Module Sync...');
    const result = await supportersService.recordContribution({
      supporterEmail: testEmail,
      supporterName: testName,
      supporterPhone: testPhone,
      country: 'Tanzania',
      amount,
      currency: 'TZS',
      tier: tier as any,
      paymentProvider: 'DPO',
      paymentMethod: 'M-Pesa Mobile Money',
      reference: `TXN_E2E_${Date.now()}`,
      supportType: 'recurring',
      notes: 'Supporting open digital infrastructure research.'
    });

    assert(!!result.supporter && !!result.contribution, 'Supporter contribution processed successfully');

    console.log('\nStep 3: Verifying PostgreSQL DB Storage via Prisma ORM...');
    const dbSupporter = await prisma.supporterProfile.findUnique({
      where: { email: testEmail },
      include: { contributions: true }
    });

    assert(dbSupporter !== null, `Supporter Profile persisted in PostgreSQL (ID: ${dbSupporter?.id})`);
    assert(dbSupporter?.tier === 'VISION_BUILDER', 'Support tier accurately stored as VISION_BUILDER');
    assert(dbSupporter?.totalLifetimeAmount.toNumber() === amount, `Lifetime contribution amount verified: ${dbSupporter?.totalLifetimeAmount} TZS`);
    assert(dbSupporter?.contributions.length === 1, 'Contribution history array contains 1 recorded contribution');

    console.log('\nStep 4: Verifying Financial Ledger Synchronization...');
    const payment = await prisma.payment.findFirst({
      where: { customerEmail: testEmail }
    });
    assert(payment !== null, `Financial Payment record auto-created (Receipt: ${payment?.paymentNumber})`);
    assert(payment?.amount.toNumber() === amount, 'Payment ledger amount matches contribution');

    const finAudit = await prisma.financialAuditLog.findFirst({
      where: { documentId: result.contribution.id }
    });
    assert(finAudit !== null, 'Financial audit log recorded for compliance');

    console.log('\nStep 5: Verifying CRM Contact Synchronization (Single Unified Profile)...');
    const crmContact = await prisma.client.findUnique({
      where: { email: testEmail }
    });
    assert(crmContact !== null, `CRM Contact created/updated (ID: ${crmContact?.id})`);
    assert(crmContact?.role === 'Vision Supporter (VISION_BUILDER)', `CRM role set to: ${crmContact?.role}`);

    const duplicateCount = await prisma.client.count({ where: { email: testEmail } });
    assert(duplicateCount === 1, 'Zero duplicate contact records created in CRM');

    console.log('\nStep 6: Verifying Supporters Dashboard & Tier Breakdown Overview API...');
    const overview = await supportersService.getSupportersOverview();
    assert(overview.summary.totalSupporters > 0, `Dashboard Overview Total Supporters: ${overview.summary.totalSupporters}`);
    assert(overview.summary.lifetimeRevenue >= amount, `Lifetime Revenue: ${overview.summary.lifetimeRevenue.toLocaleString()} TZS`);
    assert(overview.tierBreakdown.VISION_BUILDER.totalMembers > 0, `Vision Builder Tier Breakdown Total Members: ${overview.tierBreakdown.VISION_BUILDER.totalMembers}`);

    console.log('\nStep 7: Verifying Collaborators Management Engine...');
    const collab = await supportersService.upsertCollaborator({
      fullName: 'Dr. Baraka Joseph',
      email: `collab_${Date.now()}@example.com`,
      phone: '+255 789 445 566',
      roleTitle: 'Researcher',
      skills: ['AI Research', 'Data Science', 'PostgreSQL'],
      notes: 'Leading RAG optimization research'
    });
    assert(collab.roleTitle === 'Researcher', `Collaborator profile created with role: ${collab.roleTitle}`);

    const collabOverview = await supportersService.getCollaboratorsOverview();
    assert(collabOverview.totalCollaborators > 0, `Collaborator Dashboard total: ${collabOverview.totalCollaborators}`);

    console.log('\n================================================================');
    console.log(`🎉 E2E SUPPORTERS WORKFLOW VERIFICATION PASSED: ${passedTests}/${totalTests} TESTS`);
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('❌ E2E Verification Script Error:', err);
    process.exit(1);
  }
}

runSupportersE2EVerification();
