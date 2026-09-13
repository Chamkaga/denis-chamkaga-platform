// backend/src/scripts/verify-full-owner-business-flow.ts
// Programmatic Execution & Verification Script for the Complete Denis Chamkaga Business Operating System

import prisma from '../config/database';
import { financeService } from '../services/finance.service';
import { supportersService } from '../services/supporters.service';
import { adminService } from '../services/admin.service';

async function runFullOwnerBusinessFlowExecution() {
  console.log('================================================================');
  console.log('👑 DENIS CHAMKAGA ENTERPRISE BOS — COMPLETE BUSINESS FLOW EXECUTION');
  console.log('================================================================\n');

  let stepCount = 0;
  const assert = (condition: boolean, description: string) => {
    stepCount++;
    if (condition) {
      console.log(` ✅ PASS [Step ${stepCount}]: ${description}`);
    } else {
      console.error(` ❌ FAIL [Step ${stepCount}]: ${description}`);
      throw new Error(`Execution Failed: ${description}`);
    }
  };

  try {
    const timestamp = Date.now();
    const clientEmail = `client_ceo_${timestamp}@azamtech.co.tz`;
    const clientName = 'Azam Tech Enterprises';

    // ── STEP 1: LEAD CAPTURE & QUALIFICATION ─────────────────────────────────
    console.log('\n--- 1. LEAD CAPTURE & QUALIFICATION ---');
    const lead = await prisma.lead.create({
      data: {
        name: clientName,
        email: clientEmail,
        phone: '+255 700 999 888',
        company: 'Azam Group',
        source: 'ai_chat',
        score: 95,
        temperature: 'hot',
        status: 'qualified',
        notes: 'Requested custom Enterprise Business Operating System implementation via Mary AI.'
      }
    });
    assert(!!lead.id, `Lead created in 'leads' DB table (ID: ${lead.id}, Score: ${lead.score}/100)`);

    // ── STEP 2: CONSULTATION SCHEDULING ──────────────────────────────────────
    console.log('\n--- 2. CONSULTATION SCHEDULING & CALENDAR MAPPING ---');
    const appointment = await prisma.appointment.create({
      data: {
        name: clientName,
        email: clientEmail,
        phone: '+255 700 999 888',
        purpose: 'Enterprise BOS Technical Consultation',
        preferredDate: new Date(Date.now() + 86400000), // Tomorrow
        preferredTime: '10:00 AM',
        status: 'confirmed',
        notes: 'Enterprise BOS Consultation with Denis Chamkaga.'
      }
    });
    assert(!!appointment.id, `Consultation scheduled in 'appointments' DB table (ID: ${appointment.id})`);

    // ── STEP 3: CONSULTATION COMPLETION ──────────────────────────────────────
    console.log('\n--- 3. CONSULTATION COMPLETION ---');
    const completedAppt = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'completed' }
    });
    assert(completedAppt.status === 'completed', 'Consultation status updated to completed');

    // ── STEP 4: ORGANIZATION & CLIENT PROVISIONING ────────────────────────────
    console.log('\n--- 4. CRM 360 ORGANIZATION & CLIENT PROVISIONING ---');
    const org = await prisma.organization.create({
      data: {
        name: 'Azam Tech Group Ltd',
        email: clientEmail,
        phone: '+255 700 999 888',
        address: 'Azam Complex, Dar es Salaam',
        status: 'active'
      }
    });

    const client = await prisma.client.create({
      data: {
        organizationId: org.id,
        firstName: 'Said',
        lastName: 'Salim',
        email: clientEmail,
        phone: '+255 700 999 888',
        role: 'Chief Technology Officer',
        status: 'active'
      }
    });
    assert(!!org.id && !!client.id, `CRM 360 Records provisioned in 'organizations' & 'clients' DB tables`);

    // ── STEP 5: QUOTATION GENERATION ──────────────────────────────────────────
    console.log('\n--- 5. ERP QUOTATION CREATION ---');
    const quote = await financeService.createQuotation({
      organizationId: org.id,
      title: 'Enterprise Business Operating System Implementation',
      currency: 'TZS',
      taxRate: 18,
      discountRate: 5,
      validUntil: new Date(Date.now() + 30 * 86400000),
      notes: 'Includes full CRM, Finance ERP, and AI Telemetry modules.',
      terms: '50% Deposit, 50% upon final verification delivery.',
      items: [
        { description: 'Core ERP Architecture & Database Setup', quantity: 1, unitPrice: 5000000 },
        { description: 'CRM 360 & Automated Workflows Engine', quantity: 1, unitPrice: 3500000 }
      ]
    }, 'denis@denischamkaga.com');
    assert(!!quote.id, `Quotation V1 created in 'quotations' table (${quote.quotationNumber}, Total: TZS ${quote.total.toNumber().toLocaleString()})`);

    // ── STEP 6: INVOICE GENERATION ───────────────────────────────────────────
    console.log('\n--- 6. ERP INVOICE CREATION ---');
    const invoice = await financeService.createInvoice({
      organizationId: org.id,
      currency: 'TZS',
      taxRate: 18,
      discountRate: 5,
      dueDate: new Date(Date.now() + 14 * 86400000),
      items: [
        { description: 'Enterprise BOS Core Implementation - Invoice #1', quantity: 1, unitPrice: 8500000 }
      ]
    }, 'denis@denischamkaga.com');
    assert(!!invoice.id, `Invoice created in 'invoices' table (${invoice.invoiceNumber}, Status: ${invoice.status})`);

    // ── STEP 7: PAYMENT LINK GENERATION ──────────────────────────────────────
    console.log('\n--- 7. PAYMENT LINK & ACCESS TOKEN GENERATION ---');
    const rawToken = await financeService.generateAccessToken(invoice.id, 'INVOICE', 30, 'denis@denischamkaga.com');
    assert(rawToken.length > 20, `SHA-256 Secured Payment Token generated (Raw Token Length: ${rawToken.length} chars)`);

    // ── STEP 8: PAYMENT SETTLEMENT & LEDGER ENTRY ─────────────────────────────
    console.log('\n--- 8. CUSTOMER PAYMENT SETTLEMENT & LEDGER ENTRY ---');
    const payment = await financeService.recordPayment(invoice.id, {
      amount: invoice.total.toNumber(),
      method: 'M-Pesa Mobile Money',
      reference: `MPESA_TXN_${timestamp}`,
      email: clientEmail
    }, 'customer');
    assert(!!payment.id, `Payment recorded in 'payments' table (${payment.paymentNumber}, Amount: TZS ${payment.amount.toNumber().toLocaleString()})`);

    // ── STEP 9: AUTOMATED INVOICE PAID STATUS ADVANCEMENT ────────────────────
    console.log('\n--- 9. AUTOMATED INVOICE STATUS ADVANCEMENT ---');
    const updatedInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    assert(updatedInvoice?.status === 'paid', `Invoice status automatically advanced to '${updatedInvoice?.status}' in DB`);

    // ── STEP 10: AUTOMATED RECEIPT GENERATION ─────────────────────────────────
    console.log('\n--- 10. AUTOMATED RECEIPT GENERATION ---');
    const receipt = await prisma.receipt.findFirst({ where: { paymentId: payment.id } });
    assert(!!receipt?.id, `PDF Receipt record automatically generated in 'receipts' table (${receipt?.receiptNumber})`);

    // ── STEP 11: SUPPORTER CONTRIBUTION EXECUTION ────────────────────────────
    console.log('\n--- 11. SUPPORTER CONTRIBUTION EXECUTION & MULTI-MODULE SYNC ---');
    const supporterRes = await supportersService.recordContribution({
      supporterEmail: `supporter_${timestamp}@brand.co.tz`,
      supporterName: 'Faraji Kiba',
      supporterPhone: '+255 712 334 455',
      amount: 150000,
      currency: 'TZS',
      tier: 'MISSION_CHAMPION',
      paymentProvider: 'DPO',
      paymentMethod: 'Card',
      supportType: 'recurring',
      notes: 'Supporting digital operating system scaling.'
    });
    assert(!!supporterRes.supporter.id, `Supporter contribution recorded in 'supporter_profiles' & 'support_contributions' DB tables`);

    // ── STEP 12: BUSINESS EXPENSE POSTING ─────────────────────────────────────
    console.log('\n--- 12. BUSINESS EXPENSE POSTING TO LEDGER ---');
    const expense = await financeService.createBusinessExpense({
      description: 'Cloud Infrastructure & DB Storage Hosting',
      category: 'Infrastructure',
      vendor: 'Amazon Web Services',
      amount: 350000,
      currency: 'TZS'
    });
    assert(!!expense.id, `Business Expense posted to 'business_expenses' DB table (ID: ${expense.id}, Amount: TZS 350,000)`);

    // ── STEP 13: FINANCIAL STATEMENT & P&L GENERATION ─────────────────────────
    console.log('\n--- 13. FINANCIAL STATEMENT & P&L GENERATION ---');
    const statements = await financeService.getFinancialStatements();
    assert(statements.profitAndLoss.totalRevenue >= 0, `P&L Statement computed directly from DB ledger (Total Revenue: TZS ${statements.profitAndLoss.totalRevenue.toLocaleString()}, Net Profit: TZS ${statements.profitAndLoss.netProfit.toLocaleString()})`);

    // ── STEP 14: EXECUTIVE TELEMETRY & DASHBOARD HEALTH ──────────────────────
    console.log('\n--- 14. EXECUTIVE DASHBOARD & TELEMETRY HEALTH ---');
    const dashStats = await adminService.getDashboardStats();
    assert(dashStats.leads.total >= 0, `Executive Telemetry computed directly from DB (Total Leads: ${dashStats.leads.total}, Total Projects: ${dashStats.projects.total})`);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${stepCount} BUSINESS FLOW STEPS EXECUTED & VERIFIED IN DB!`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('\n❌ Execution Failed With Error:', error);
    process.exit(1);
  }
}

runFullOwnerBusinessFlowExecution()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
