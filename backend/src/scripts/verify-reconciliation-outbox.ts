// backend/src/scripts/verify-reconciliation-outbox.ts
// Verification Script for Payment Reconciliation Engine & Outbox Pattern

import prisma from '../config/database';
import { paymentReconciliationService } from '../services/payment-reconciliation.service';
import { outboxService } from '../ai/outbox.service';
import { distributedLockService } from '../services/distributed-lock.service';

async function runReconciliationAndOutboxVerification() {
  console.log('================================================================');
  console.log('💳 DPO PAYMENT RECONCILIATION & TRANSACTIONAL OUTBOX VERIFICATION');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const transactionId = `DPO_TXN_${timestamp}`;
  const invoiceId = `INV_REC_${timestamp}`;

  let totalSteps = 0;
  let passedSteps = 0;

  const assertRec = (condition: boolean, label: string) => {
    totalSteps++;
    if (condition) {
      passedSteps++;
      console.log(` ✅ PASS [Step ${totalSteps}]: ${label}`);
    } else {
      console.error(` ❌ FAIL [Step ${totalSteps}]: ${label}`);
    }
  };

  try {
    // 1. Transactional Outbox Pattern Verification
    console.log('1. Testing Transactional Outbox Pattern...');
    const outboxRecord = await outboxService.saveEvent('InvoicePaid', {
      invoiceId,
      amount: 10000000,
      customerEmail: 'client@example.com'
    });
    assertRec(outboxRecord.status === 'PENDING', `Outbox record created with status PENDING (${outboxRecord.eventType})`);

    const dispatchedCount = await outboxService.processOutboxQueue();
    assertRec(dispatchedCount > 0, `Outbox Worker successfully dispatched ${dispatchedCount} pending events to EventBus`);
    assertRec(outboxRecord.status === 'PUBLISHED', 'Outbox event status updated to PUBLISHED');

    // 2. Distributed Lock Verification
    console.log('\n2. Testing Distributed Lock Manager...');
    const lock1 = await distributedLockService.acquireLock(`reconcile_${transactionId}`, 5000);
    assertRec(lock1.acquired === true, 'Distributed lock acquired successfully');

    const lock2 = await distributedLockService.acquireLock(`reconcile_${transactionId}`, 5000);
    assertRec(lock2.acquired === false, 'Duplicate distributed lock acquisition prevented (Collision Protection)');

    await distributedLockService.releaseLock(`reconcile_${transactionId}`, lock1.lockToken);
    const lock3 = await distributedLockService.acquireLock(`reconcile_${transactionId}`, 5000);
    assertRec(lock3.acquired === true, 'Lock re-acquired after release');

    // 3. Payment Reconciliation Engine Verification (DPO Callback -> Cash Clearing)
    console.log('\n3. Processing DPO Gateway Callback...');
    const dpoResult = await paymentReconciliationService.processDpoCallback({
      transactionId,
      invoiceId,
      customerEmail: 'reconciled_client@example.com',
      grossAmount: 10000000,
      currency: 'TZS',
      gatewayName: 'DPO Payment Gateway',
      paymentStatus: 'SUCCESS',
      dpoFeePercentage: 3.5
    });

    assertRec(dpoResult.gross === 10000000, 'DPO Callback processed gross amount: 10,000,000 TZS');
    assertRec(dpoResult.dpoFee === 350000, 'DPO Merchant Fee calculated: 350,000 TZS (3.5%)');
    assertRec(dpoResult.netClearing === 9650000, 'Net amount posted to Cash Clearing Account (In Transit): 9,650,000 TZS');

    // 4. Bank Settlement Reconciliation Verification (Cash Clearing -> Main Bank Account)
    console.log('\n4. Processing Bank Settlement Clearance...');
    const settlementResult = await paymentReconciliationService.processBankSettlement({
      settlementId: `SETTLE_${timestamp}`,
      transactionId,
      settledAmount: 9650000,
      bankFeeAmount: 15000,
      bankName: 'CRDB Bank Plc',
      settledAt: new Date()
    });

    assertRec(settlementResult.status === 'SETTLED', 'Bank settlement cleared into Main Operating Bank Account (SETTLED)');

    // 5. Financial Reconciliation Summary
    const summary = await paymentReconciliationService.getReconciliationSummary();
    assertRec(summary.reconciliationStatus === 'BALANCED', `Financial Reconciliation Engine status: ${summary.reconciliationStatus}`);

    console.log('\n================================================================');
    console.log(`🎉 PAYMENT RECONCILIATION & OUTBOX PASSED: ${passedSteps}/${totalSteps} TESTS`);
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('❌ Reconciliation verification error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runReconciliationAndOutboxVerification();
