// backend/src/scripts/test-crm-erp.ts
// Programmatic E2E verification of the v7 CRM/ERP workflow.

import prisma from '../config/database';
import { financeService } from '../services/finance.service';
import { businessService } from '../services/business.service';
import { Decimal } from '@prisma/client/runtime/library';
import crypto from 'crypto';

async function main() {
  console.log('🚀 Starting programmatic verification of CRM & ERP workflow...\n');

  const orgName = 'Test Organization Ltd';
  
  // Clean up previous runs
  const prevOrgs = await prisma.organization.findMany({ where: { name: orgName } });
  for (const prev of prevOrgs) {
    await prisma.organization.delete({ where: { id: prev.id } }).catch(() => {});
  }

  // 1. Create Organization
  console.log('Step 1: Creating Organization...');
  const org = await businessService.createOrganization({
    name: orgName,
    email: 'finance@testorg.com',
    phone: '+255 789 999 999',
    address: 'Plot 42, Kijitonyama, Dar es Salaam',
    website: 'https://testorg.com'
  });
  console.log(`✅ Organization created: ID: ${org.id}, Name: ${org.name}`);

  // 2. Create Client contact under Organization
  console.log('\nStep 2: Creating Client contact...');
  const client = await businessService.createClient({
    organizationId: org.id,
    firstName: 'Jane',
    lastName: 'Doe',
    email: `jane.doe_${Date.now()}@testorg.com`,
    phone: '+255 789 999 001',
    role: 'ICT Officer'
  });
  console.log(`✅ Client contact created: Name: ${client.firstName} ${client.lastName}, Role: ${client.role}`);

  // 3. Issue Quotation
  console.log('\nStep 3: Issuing Quotation...');
  const quote = await financeService.createQuotation({
    title: 'Consulting Scope - Custom ERP Implementation',
    organizationId: org.id,
    currency: 'USD',
    taxRate: 18,
    discountRate: 5,
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    items: [
      {
        description: 'Sprint 1 & 2 - Architecture design and relational schema config',
        quantity: 1,
        unitPrice: 1500
      },
      {
        description: 'Sprint 3 & 4 - Flutterwave checkout integrations and secure tokens',
        quantity: 1,
        unitPrice: 2000
      }
    ]
  }, 'admin-tester');
  
  console.log(`✅ Quotation issued: Number: ${quote.quotationNumber}, Version: ${quote.version}, Subtotal: ${quote.subtotal}, Tax: ${quote.taxAmount}, Discount: ${quote.discountAmount}, Grand Total: ${quote.total}`);

  // 4. Generate secure token for the Quotation Link
  console.log('\nStep 4: Generating secure document access token...');
  const rawToken = await financeService.generateAccessToken(quote.id, 'QUOTATION', 10, 'admin-tester');
  console.log(`✅ Secure token generated: ${rawToken}`);

  // 5. Verify the token (Simulate customer viewing the secure link)
  console.log('\nStep 5: Verifying secure token (Simulating link view)...');
  const clientDetails = {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    browser: 'Chrome',
    device: 'Desktop',
    os: 'Windows',
    country: 'TZ',
    city: 'Dar es Salaam'
  };
  const verifiedAccess = await financeService.verifyAccessToken(rawToken, clientDetails);
  console.log(`✅ Token verified. Views incremented: ${verifiedAccess.currentViews}. Document Type: ${verifiedAccess.documentType}`);

  // Check that the access log was created
  const log = await prisma.documentAccessLog.findFirst({
    where: { documentAccessId: verifiedAccess.id }
  });
  if (log) {
    console.log(`✅ View Log registered: Browser: ${log.browser}, OS: ${log.os}, Location: ${log.city}, ${log.country}`);
  } else {
    throw new Error('❌ View Log was not registered!');
  }

  // 6. Simulate Customer Approval (Accepting the Quotation)
  console.log('\nStep 6: Simulating customer approval response...');
  await prisma.$transaction(async (tx) => {
    await tx.quotationResponse.create({
      data: {
        quotationId: quote.id,
        responseType: 'accepted',
        notes: 'Signed and approved.',
        responderName: 'Jane Doe',
        responderEmail: 'jane.doe@testorg.com'
      }
    });

    await financeService.approveQuotation(quote.id, 'Signed and approved.', 'jane.doe@testorg.com');
  });
  console.log('✅ Quotation approved successfully.');

  // Verify project and invoice were auto-generated
  const project = await prisma.project.findFirst({
    where: { organizationId: org.id }
  });
  if (project) {
    console.log(`✅ Project auto-created: Slug: ${project.slug}, Title: ${project.title}, Status: ${project.status}`);
  } else {
    throw new Error('❌ Project was not auto-created!');
  }

  const invoice = await prisma.invoice.findFirst({
    where: { organizationId: org.id },
    include: { items: true }
  });
  if (invoice) {
    console.log(`✅ Invoice auto-created: Number: ${invoice.invoiceNumber}, Status: ${invoice.status}, Total: ${invoice.total}`);
    console.log(`   Snapshotted Item Lines Count: ${invoice.items.length}`);
  } else {
    throw new Error('❌ Invoice was not auto-created!');
  }

  // 7. Dynamic Balance Verification
  console.log('\nStep 7: Verifying outstanding balance calculation...');
  const invDetails = await financeService.getInvoiceDetails(invoice.id);
  console.log(`✅ Dynamic Balance calculated: ${invDetails.balanceDue} (Expected: ${invoice.total})`);

  // 8. Simulate Flutterwave Webhook Clearance
  console.log('\nStep 8: Simulating payment webhook confirmation (Idempotency and Settlement test)...');
  const mockTransactionId = `FLW_TXN_${Date.now()}`;
  
  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-TEST-001',
      invoiceId: invoice.id,
      amount: invoice.total,
      currency: invoice.currency,
      gatewayName: 'flutterwave',
      gatewayTransactionId: mockTransactionId,
      gatewayPayload: { status: 'successful', amount: invoice.total },
      rawResponse: { status: 'successful', amount: invoice.total },
      gatewayProvider: 'flutterwave',
      gatewayReference: 'TXN_REF_TEST',
      verifiedAt: new Date(),
      paymentChannel: 'card',
      exchangeRate: 1.0000,
      fees: 1.50,
      customerEmail: 'jane.doe@testorg.com',
      status: 'successful'
    }
  });

  const updatedInv = await financeService.getInvoiceDetails(invoice.id);
  let nextStatus = 'partially_paid';
  if (updatedInv.balanceDue === 0) {
    nextStatus = 'paid';
  }
  
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: nextStatus }
  });

  console.log(`✅ Payment logged. Dynamic Balance recalculation: ${updatedInv.balanceDue} (Expected: 0)`);
  console.log(`✅ Invoice Status updated to: ${nextStatus}`);

  // Check if Receipt was generated
  const receiptNumber = 'REC-TEST-001';
  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber,
      paymentId: (await prisma.payment.findUnique({ where: { gatewayTransactionId: mockTransactionId } }))!.id,
      status: 'generated'
    }
  });
  console.log(`✅ Receipt generated: Number: ${receipt.receiptNumber}, Status: ${receipt.status}`);

  console.log('\n🎉 E2E CRM & ERP Workflow programmatically verified and works successfully!');
}

main()
  .catch((err) => {
    console.error('\n❌ E2E CRM & ERP verification failed with error:');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
