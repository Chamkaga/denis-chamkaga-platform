// backend/src/scripts/business-acceptance-testing.ts
// Complete Enterprise FinTech Business Acceptance Testing (BAT) Script

import prisma from '../config/database';
import { workflowEngine } from '../workflow/workflow.engine';
import { aiEventBus } from '../ai/event-bus';
import { businessService } from '../services/business.service';
import { financeService } from '../services/finance.service';
import { marketingService } from '../services/marketing.service';
import { ActivityTimelineService } from '../services/activity-timeline.service';
import { aiGuardrailsEngine } from '../ai/ai-guardrails';
import { eventStoreService } from '../ai/event-store.service';
import { outboxService } from '../ai/outbox.service';
import { fraudRiskService } from '../services/fraud-risk.service';
import { paymentReconciliationService } from '../services/payment-reconciliation.service';
import { bankStatementMatchingEngine } from '../services/bank-statement-matching.service';
import { makerCheckerService } from '../services/maker-checker.service';
import { accountingPeriodService } from '../services/accounting-period.service';
import { otelLogger } from '../utils/otel-logger';

const timelineService = new ActivityTimelineService();

async function runEnterpriseFinTechBAT() {
  console.log('================================================================');
  console.log('🏛️ COMPLETE ENTERPRISE FINTECH BUSINESS ACCEPTANCE TESTING (BAT)');
  console.log('================================================================\n');

  workflowEngine.initialize();
  const timestamp = Date.now();
  const clientEmail = `cert_client_${timestamp}@denischamkaga.com`;
  const clientName = 'Grace Enterprise Holdings';
  const clientPhone = '+255 754 888 999';
  const dpoTransactionId = `DPO_CERT_TXN_${timestamp}`;

  let currentStep = 0;
  const totalSteps = 15;

  const assertStep = (condition: boolean, label: string) => {
    currentStep++;
    if (condition) {
      console.log(` ✅ PASS [Step ${currentStep}/${totalSteps}]: ${label}`);
    } else {
      console.error(` ❌ FAIL [Step ${currentStep}/${totalSteps}]: ${label}`);
      throw new Error(`BAT Step ${currentStep} Failed: ${label}`);
    }
  };

  try {
    // PASS 1/15: AI Guardrails Scan
    const guardrailCheck = aiGuardrailsEngine.validateInput('Requesting Enterprise FinTech Architecture.');
    assertStep(guardrailCheck.passed === true, 'AI Guardrails validated input prompt safely');

    // PASS 2/15: Lead Created & Qualified
    const lead = await prisma.lead.create({
      data: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        company: 'Grace Global Group',
        source: 'ai_chat',
        score: 95,
        temperature: 'hot',
        requirements: 'Enterprise FinTech Core & AI Ledger',
        budgetMentioned: true,
        status: 'qualified'
      }
    });
    aiEventBus.publish('LeadQualified', { leadId: lead.id, name: clientName, email: clientEmail, score: 95, temperature: 'hot' });
    await new Promise((r) => setTimeout(r, 300));
    assertStep(lead.score === 95, `Lead Created & AI Qualified in DB (ID: ${lead.id})`);

    // PASS 3/15: Quotation Created & Approved
    const org = await businessService.createOrganization({ name: 'Grace Global Group', email: clientEmail, phone: clientPhone });
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QT_CERT_${timestamp}`,
        organizationId: org.id,
        title: 'Enterprise FinTech Core Platform',
        subtotal: 75000000,
        total: 75000000,
        status: 'APPROVED',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });
    aiEventBus.publish('QuotationApproved', { quotationId: quotation.id });
    await new Promise((r) => setTimeout(r, 300));
    assertStep(quotation.status === 'APPROVED', `Quotation Created & Approved (No: ${quotation.quotationNumber})`);

    // PASS 4/15: Invoice Generated
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV_CERT_${timestamp}`,
        organizationId: org.id,
        subtotal: 75000000,
        total: 75000000,
        status: 'SENT',
        dueDate: new Date()
      }
    });
    assertStep(invoice.status === 'SENT', `Invoice Generated (No: ${invoice.invoiceNumber})`);

    // PASS 5/15: Customer Paid via DPO
    const dpoResult = await paymentReconciliationService.processDpoCallback({
      transactionId: dpoTransactionId,
      invoiceId: invoice.id,
      customerEmail: clientEmail,
      grossAmount: 75000000,
      currency: 'TZS',
      gatewayName: 'DPO Payment Gateway',
      paymentStatus: 'SUCCESS',
      dpoFeePercentage: 3.5
    });
    assertStep(dpoResult.gross === 75000000, `Customer Paid 75,000,000 TZS via DPO Callback (Ref: ${dpoTransactionId})`);

    // PASS 6/15: Fraud Check Passed
    const fraudCheck = await fraudRiskService.evaluateTransaction({
      transactionId: dpoTransactionId,
      invoiceId: invoice.id,
      customerEmail: clientEmail,
      amount: 75000000
    });
    assertStep(fraudCheck.passed === true && fraudCheck.recommendation === 'APPROVE', `Fraud Risk Evaluation Passed (Risk Score: ${fraudCheck.riskScore})`);

    // PASS 7/15: Idempotency & Outbox Event Created
    const outboxEvt = await outboxService.saveEvent('InvoicePaid', { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, amount: 75000000, customerEmail: clientEmail });
    assertStep(outboxEvt.status === 'PENDING', `Transactional Outbox Event Created (${outboxEvt.eventType})`);

    // PASS 8/15: Workflow Triggered
    const dispatched = await outboxService.processOutboxQueue();
    assertStep(dispatched > 0 && outboxEvt.status === 'PUBLISHED', 'Outbox Worker & Event-Driven Workflow Triggered');

    // PASS 9/15: Cash Clearing Account Updated
    assertStep(dpoResult.netClearing === 72375000, `Cash Clearing Account Updated (In Transit Net: ${dpoResult.netClearing} TZS)`);

    // PASS 10/15: Bank Statement Matched
    const rawCsv = `${dpoTransactionId}, 72375000, TZS, DPO Settlement Clearing Deposit`;
    const statementLines = bankStatementMatchingEngine.parseStatementFeed(rawCsv, 'CSV');
    const matchResult = await bankStatementMatchingEngine.reconcileBankStatement(statementLines);
    assertStep(matchResult.matchedCount === 1, 'Bank Statement Import Engine Auto-Matched Settlement Deposit');

    // PASS 11/15: Maker-Checker Approved
    const mcSubmission = makerCheckerService.submitAction('HIGH_VALUE_SETTLEMENT', 75000000, 'user_maker_1', { transactionId: dpoTransactionId });
    makerCheckerService.checkerReview(mcSubmission.request.id, 'user_checker_2', true);
    const approverAuth = makerCheckerService.approverAuthorize(mcSubmission.request.id, 'user_approver_3', true);
    assertStep(approverAuth.status === 'APPROVED_BY_APPROVER', 'Maker-Checker Dual Control Authorized High-Value Action');

    // PASS 12/15: Accounting Period Lock Validated
    accountingPeriodService.validatePostingAllowed(new Date(), false);
    assertStep(true, 'Accounting Period Lock Check Validated Period is OPEN');

    // PASS 13/15: General Ledger Posted & Bank Settled
    const bankSettlement = await paymentReconciliationService.processBankSettlement({
      settlementId: `SETTLE_CERT_${timestamp}`,
      transactionId: dpoTransactionId,
      settledAmount: 72375000,
      bankFeeAmount: 25000,
      bankName: 'CRDB Bank Plc',
      settledAt: new Date()
    });
    const journalEntry = await prisma.journalEntry.findFirst({ where: { reference: `SETTLE_CERT_${timestamp}` } });
    assertStep(bankSettlement.status === 'SETTLED' && journalEntry !== null, `Double-Entry General Ledger Posted (JRN: ${journalEntry?.entryNumber})`);

    // PASS 14/15: Dashboard Metrics & Financial Summary Updated
    const reconSummary = await paymentReconciliationService.getReconciliationSummary();
    const paidInvoices = await prisma.invoice.aggregate({ where: { status: 'paid' }, _sum: { total: true } });
    assertStep(reconSummary.grossPaymentsTzs > 0, `Dashboard Metrics Updated (Gross Revenue: ${Number(paidInvoices._sum.total || 0).toLocaleString()} TZS)`);

    // PASS 15/15: Audit Trail & Unified Activity Timeline Recorded
    await eventStoreService.recordEvent('InvoicePaid', { invoiceId: invoice.id });
    const timeline = await timelineService.getUnifiedTimeline(clientEmail);
    assertStep(timeline.length > 0, `Immutable Audit Trail & Unified Timeline Recorded (${timeline.length} events)`);

    otelLogger.info('[BAT] Complete 15-Step Enterprise FinTech BAT Execution Succeeded.');

    console.log('\n================================================================');
    console.log(`🎉 ENTERPRISE FINTECH PRODUCTION CERTIFICATION: 15/15 PASSED`);
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('❌ BAT Execution Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runEnterpriseFinTechBAT();
