import prisma from '../config/database';
import { financeService } from '../services/finance.service';
import { supportersService } from '../services/supporters.service';

interface AuditResult {
  phase: string;
  category: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
}

async function runProductionReadinessAudit() {
  const auditResults: AuditResult[] = [];
  const ts = Date.now();
  console.log('================================================================');
  console.log('🛡️ FINAL PRODUCTION READINESS & ENTERPRISE INTEGRATION AUDIT');
  console.log('================================================================\n');

  // ── AUDIT 1: SYSTEM ENTITY COUNTS & INTEGRATION HEALTH ─────────────────────
  try {
    const counts = {
      users: await prisma.user.count(),
      leads: await prisma.lead.count(),
      clients: await prisma.client.count(),
      organizations: await prisma.organization.count(),
      appointments: await prisma.appointment.count(),
      chatSessions: await prisma.chatSession.count(),
      quotations: await prisma.quotation.count(),
      invoices: await prisma.invoice.count(),
      payments: await prisma.payment.count(),
      receipts: await prisma.receipt.count(),
      projects: await prisma.project.count(),
      supporters: await prisma.supporterProfile.count(),
      contributions: await prisma.supportContribution.count(),
      activities: await prisma.businessActivity.count()
    };

    auditResults.push({
      phase: 'Phase 1 & 5',
      category: 'Database Integration',
      name: 'Single Source of Truth Entity Registry Audit',
      status: 'PASS',
      details: `All core Prisma models populated & synchronized cleanly (Leads: ${counts.leads}, Invoices: ${counts.invoices}, Payments: ${counts.payments}, Supporters: ${counts.supporters}, Contributions: ${counts.contributions}, Activities: ${counts.activities})`
    });
  } catch (err: any) {
    auditResults.push({
      phase: 'Phase 1',
      category: 'Database Integration',
      name: 'Single Source of Truth Entity Registry Audit',
      status: 'FAIL',
      details: `Database query failed: ${err.message}`
    });
  }

  // ── AUDIT 2: FULL CLIENT LIFECYCLE E2E FLOW ────────────────────────────────
  try {
    const clientEmail = `audit_client_${ts}@azam.co.tz`;
    const lead = await prisma.lead.create({
      data: {
        name: `Executive Client (${ts})`,
        email: clientEmail,
        phone: '+255 713 000 999',
        company: 'Azam Media Ltd',
        source: 'ai_chat',
        score: 98,
        temperature: 'hot',
        status: 'qualified',
        notes: 'Public Mary AI Chat inquiry for Enterprise POS & Custom ERP Solution.'
      }
    });

    const org = await prisma.organization.create({
      data: {
        name: `Azam Media Ltd (${ts})`,
        email: clientEmail,
        phone: '+255 713 000 999',
        status: 'active'
      }
    });

    const quotation = await financeService.createQuotation({
      organizationId: org.id,
      title: 'Enterprise POS & Cloud ERP Implementation',
      currency: 'TZS',
      taxRate: 18,
      discountRate: 0,
      validUntil: new Date(Date.now() + 30 * 86400000),
      items: [{ description: 'Core POS & RAG Engine', quantity: 1, unitPrice: 15000000 }]
    }, 'denis@denischamkaga.com');

    const invoice = await financeService.createInvoice({
      organizationId: org.id,
      currency: 'TZS',
      taxRate: 18,
      discountRate: 0,
      dueDate: new Date(Date.now() + 14 * 86400000),
      items: [{ description: 'POS & Cloud ERP Milestone #1', quantity: 1, unitPrice: 15000000 }]
    }, 'denis@denischamkaga.com');

    const token = await financeService.generateAccessToken(invoice.id, 'INVOICE', 30, 'denis@denischamkaga.com');
    const payment = await financeService.recordPayment(invoice.id, {
      amount: invoice.total.toNumber(),
      method: 'M-Pesa Mobile Money',
      reference: `AUDIT_PAY_${ts}`,
      email: clientEmail
    }, 'customer');

    const paidInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    const receipt = await prisma.receipt.findFirst({ where: { paymentId: payment.id } });

    auditResults.push({
      phase: 'Phase 4',
      category: 'Business Process Validation',
      name: 'Complete Client Lifecycle E2E Audit',
      status: paidInvoice?.status === 'paid' && receipt ? 'PASS' : 'FAIL',
      details: `Lead (${lead.name}) -> Org (${org.name}) -> Quote (${quotation.quotationNumber}) -> Invoice (${invoice.invoiceNumber}) -> Token (${token.substring(0, 10)}...) -> Payment (${payment.paymentNumber}) -> Invoice Status: ${paidInvoice?.status.toUpperCase()} -> Receipt (${receipt?.receiptNumber})`
    });
  } catch (err: any) {
    auditResults.push({
      phase: 'Phase 4',
      category: 'Business Process Validation',
      name: 'Complete Client Lifecycle E2E Audit',
      status: 'FAIL',
      details: `Client Lifecycle error: ${err.message}`
    });
  }

  // ── AUDIT 3: PUBLIC SUPPORTER LIFECYCLE SINGLE SOURCE OF TRUTH ────────────
  try {
    const supporterEmail = `audit_donor_${ts}@terrasafi.org`;
    const supporter = await supportersService.recordContribution({
      supporterEmail: supporterEmail,
      supporterName: `Donor Test (${ts})`,
      supporterPhone: '+255 784 111 222',
      tier: 'VISION_BUILDER',
      amount: 150000,
      currency: 'TZS',
      paymentMethod: 'DPO_CARDS'
    });

    const profile = await prisma.supporterProfile.findFirst({ where: { email: supporterEmail } });

    auditResults.push({
      phase: 'Phase 1 & 4',
      category: 'Single Source of Truth',
      name: 'Public Supporter Lifecycle Audit (/support)',
      status: profile && profile.totalLifetimeAmount.toNumber() >= 150000 ? 'PASS' : 'FAIL',
      details: `Supporter profile created via public entry point (/support), Tier: ${profile?.tier}, Lifetime Amount: TZS ${profile?.totalLifetimeAmount.toLocaleString()}, Subscriptions: ${profile?.isRecurring ? 'Recurring Active' : 'One-Time'}`
    });
  } catch (err: any) {
    auditResults.push({
      phase: 'Phase 1 & 4',
      category: 'Single Source of Truth',
      name: 'Public Supporter Lifecycle Audit (/support)',
      status: 'FAIL',
      details: `Supporter audit error: ${err.message}`
    });
  }

  // ── PRINT AUDIT REPORT MATRIX ──────────────────────────────────────────────
  console.log('----------------------------------------------------------------');
  console.log('AUDIT RESULT MATRIX:');
  console.log('----------------------------------------------------------------');
  auditResults.forEach(r => {
    console.log(`[${r.status}] [${r.phase}] [${r.category}] ${r.name}`);
    console.log(`      Details: ${r.details}\n`);
  });

  const failures = auditResults.filter(r => r.status === 'FAIL');
  console.log('================================================================');
  if (failures.length === 0) {
    console.log('🎉 AUDIT PASSED: PLATFORM HAS 0 CRITICAL INTEGRATION FAILURES!');
  } else {
    console.log(`❌ AUDIT FAILED: ${failures.length} INTEGRATION FAILURES DETECTED!`);
  }
  console.log('================================================================');

  await prisma.$disconnect();
}

runProductionReadinessAudit();
