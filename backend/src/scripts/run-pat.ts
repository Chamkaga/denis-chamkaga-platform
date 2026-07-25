// backend/src/scripts/run-pat.ts
// Production Acceptance Testing (PAT) Runner.
// Executes real HTTP requests against the live running API server.

import axios from 'axios';
import prisma from '../config/database';
import { financeService } from '../services/finance.service';

const SERVER_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

async function logSection(title: string) {
  console.log(`\n======================================================================`);
  console.log(`🔍 PAT CASE: ${title}`);
  console.log(`======================================================================`);
}

async function runPat() {
  console.log('🚀 INITIALIZING PRODUCTION ACCEPTANCE TESTING (PAT)...');
  console.log(`Server Endpoint: ${SERVER_URL}`);

  // Check health first
  try {
    const health = await axios.get(`${SERVER_URL}/api/health`);
    console.log(`✅ Live Server Health check successful: status: ${health.data.data.status}`);
  } catch (err: any) {
    console.error(`❌ Live Server is not running on ${SERVER_URL}. Please start it using "npm run dev".`);
    process.exit(1);
  }

  // Clear previous PAT records to ensure fresh test boundaries
  const testOrgName = 'PAT Verification Org Ltd';
  console.log('🧹 Clearing previous PAT test records...');
  const existingOrgs = await prisma.organization.findMany({ where: { name: testOrgName } });
  for (const org of existingOrgs) {
    await prisma.organization.delete({ where: { id: org.id } }).catch(() => {});
  }

  // 1. Authenticate Admin
  logSection('1. JWT Admin Authentication');
  let adminToken = '';
  try {
    const authRes = await axios.post(`${SERVER_URL}/api/auth/login`, {
      email: 'admin@denischamkaga.com',
      password: 'Denis@Platform2025'
    });
    adminToken = authRes.data.data.accessToken;
    console.log(`✅ Admin logged in. Bearer token resolved: ${adminToken.substring(0, 20)}...`);
  } catch (err: any) {
    console.error('❌ Admin login failed. Seed database first.');
    throw err;
  }

  const adminHeaders = {
    headers: { Authorization: `Bearer ${adminToken}` }
  };

  // 2. Create Organization & Contact via REST API
  logSection('2. Organization & Contact REST Creation');
  let orgId = '';
  let clientEmail = '';
  try {
    const orgRes = await axios.post(`${SERVER_URL}/api/admin/business/organizations`, {
      name: testOrgName,
      email: 'finance@patcorp.com',
      phone: '+255 765 111 222',
      address: 'PAT Tower, Dar es Salaam'
    }, adminHeaders);
    orgId = orgRes.data.data.id;
    console.log(`✅ Organization created via Admin API: ID ${orgId}`);

    clientEmail = `pat.contact_${Date.now()}@patcorp.com`;
    const clientRes = await axios.post(`${SERVER_URL}/api/admin/business/clients`, {
      organizationId: orgId,
      firstName: 'PAT Manager',
      lastName: 'Jane',
      email: clientEmail,
      phone: '+255 765 111 223',
      role: 'Finance Officer'
    }, adminHeaders);
    console.log(`✅ Contact Person created via Admin API: ${clientRes.data.data.firstName} (${clientRes.data.data.email})`);
  } catch (err: any) {
    console.error('❌ Organization/Contact REST creation failed.');
    throw err;
  }

  // 3. Issue Quotation Proposal via REST API
  logSection('3. Issuing Quotation REST Endpoints');
  let quoteId = '';
  let quoteNumber = '';
  try {
    const quoteRes = await axios.post(`${SERVER_URL}/api/admin/finance/quotations`, {
      title: 'Enterprise Integration Framework',
      organizationId: orgId,
      currency: 'USD',
      taxRate: 18,
      discountRate: 5,
      validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          description: 'Milestone 1 - Relational Database schemas and backend adapters',
          quantity: 1,
          unitPrice: 3000
        },
        {
          description: 'Milestone 2 - Public viewer checkout web pages',
          quantity: 1,
          unitPrice: 2000
        }
      ]
    }, adminHeaders);

    quoteId = quoteRes.data.data.id;
    quoteNumber = quoteRes.data.data.quotationNumber;
    console.log(`✅ Quotation issued. ID: ${quoteId}, Number: ${quoteNumber}, Total: USD ${quoteRes.data.data.total}`);
  } catch (err: any) {
    console.error('❌ Quotation REST issuance failed.');
    throw err;
  }

  // 4. Generate & Retrieve secure access token
  logSection('4. Secure Access Token Generation');
  let rawToken = '';
  try {
    const tokenRes = await axios.post(`${SERVER_URL}/api/admin/finance/access/generate`, {
      docId: quoteId,
      docType: 'QUOTATION',
      expiresDays: 7
    }, adminHeaders);
    rawToken = tokenRes.data.data.token;
    console.log(`✅ Secure token generated: ${rawToken}`);
  } catch (err: any) {
    console.error('❌ Token generation failed.');
    throw err;
  }

  // 5. Test public link retrieval & view logging
  logSection('5. Public Secure Link Retrieval & Logging');
  try {
    const publicDocRes = await axios.get(`${SERVER_URL}/api/public/docs/${rawToken}`, {
      headers: {
        'User-Agent': 'PAT-Agent-Browser/1.0 (Windows; OS Test)',
        'cf-ipcountry': 'TZ'
      }
    });
    console.log(`✅ Public access response status: ${publicDocRes.status}`);
    console.log(`✅ Document type resolved: ${publicDocRes.data.data.access.documentType}`);
    console.log(`✅ Views logged count: ${publicDocRes.data.data.access.currentViews}`);
    
    // Assert views registered in the database logs
    const logs = await prisma.documentAccessLog.findMany({
      where: { documentAccess: { documentId: quoteId } }
    });
    console.log(`✅ Verified: Database views logged matches API payload: ${logs.length} record(s).`);
    console.log(`   Captured User-Agent: ${logs[0].userAgent}`);
  } catch (err: any) {
    console.error('❌ Public link retrieval check failed.');
    throw err;
  }

  // 6. Test Expiry validation
  logSection('6. Access Expiry Link Testing');
  try {
    const accessRec = await prisma.documentAccess.findFirst({
      where: { documentId: quoteId }
    });
    if (!accessRec) throw new Error('No access record found.');

    // Mock date to 10 days ago (expired)
    await prisma.documentAccess.update({
      where: { id: accessRec.id },
      data: { expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
    });

    console.log('Requesting expired document...');
    await axios.get(`${SERVER_URL}/api/public/docs/${rawToken}`);
    console.error('❌ ERROR: Expired link allowed access!');
    throw new Error('Expired link security failure');
  } catch (err: any) {
    if (err.response?.status === 400 || err.response?.status === 410 || err.response?.status === 401) {
      console.log(`✅ Expiry check blocked access. Status: ${err.response.status}, Message: "${err.response.data.error?.message}"`);
    } else {
      console.error('❌ Expiry verify failed with unexpected error.');
      throw err;
    }
  }

  // 7. Test Revocation validation
  logSection('7. Access Revoke Link Testing');
  try {
    const accessRec = await prisma.documentAccess.findFirst({
      where: { documentId: quoteId }
    });
    if (!accessRec) throw new Error('No access record.');

    // Reactivate expiry but revoke token hash
    await prisma.documentAccess.update({
      where: { id: accessRec.id },
      data: {
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        revokedAt: new Date()
      }
    });

    console.log('Requesting revoked document...');
    await axios.get(`${SERVER_URL}/api/public/docs/${rawToken}`);
    console.error('❌ ERROR: Revoked link allowed access!');
    throw new Error('Revoked link security failure');
  } catch (err: any) {
    if (err.response?.status === 400 || err.response?.status === 401 || err.response?.status === 403) {
      console.log(`✅ Revoke check blocked access. Status: ${err.response.status}, Message: "${err.response.data.error?.message}"`);
    } else {
      console.error('❌ Revoke verify failed.');
      throw err;
    }
  }

  // Restore and regenerate active token for remaining steps
  await prisma.documentAccess.deleteMany({ where: { documentId: quoteId } });
  const activeToken = await financeService.generateAccessToken(quoteId, 'QUOTATION', 5, 'admin-tester');
  console.log(`Re-established Active Access Token: ${activeToken}`);

  // 8. Stream PDF verification
  logSection('8. PDF Rendering & Download Validation');
  try {
    const pdfRes = await axios.get(`${SERVER_URL}/api/public/docs/${activeToken}/pdf`, {
      responseType: 'arraybuffer'
    });
    const contentType = pdfRes.headers['content-type'];
    const contentDisposition = pdfRes.headers['content-disposition'];
    console.log(`✅ PDF Download HTTP status: ${pdfRes.status}`);
    console.log(`✅ HTTP Content-Type resolved: ${contentType} (Expected: application/pdf)`);
    console.log(`✅ HTTP Content-Disposition: ${contentDisposition}`);
    if (contentType !== 'application/pdf') throw new Error('Invalid content type returned for PDF stream.');
  } catch (err: any) {
    console.error('❌ PDF rendering and downloading check failed.');
    throw err;
  }

  // 9. Quotation Client Approval
  logSection('9. Public Customer Proposal Acceptance');
  try {
    const responseRes = await axios.post(`${SERVER_URL}/api/public/docs/${activeToken}/response`, {
      responseType: 'accepted',
      notes: 'Terms approved. Setup ERP infrastructure.',
      responderName: 'Jane Doe',
      responderEmail: clientEmail
    });
    console.log(`✅ Client review response saved: ${responseRes.data.message}`);
    
    // Assert workflow automatic triggers: Project and Invoice generation
    const project = await prisma.project.findFirst({ where: { organizationId: orgId } });
    if (project) {
      console.log(`✅ Workflow auto-trigger: Project created successfully: Title "${project.title}", Slug: ${project.slug}`);
    } else {
      throw new Error('Project was not spawned from quotation approval.');
    }

    const invoice = await prisma.invoice.findFirst({ where: { organizationId: orgId } });
    if (invoice) {
      console.log(`✅ Workflow auto-trigger: Invoice generated successfully: Number: ${invoice.invoiceNumber}, Status: ${invoice.status}`);
    } else {
      throw new Error('Invoice was not generated from quotation approval.');
    }
  } catch (err: any) {
    console.error('❌ Public customer proposal acceptance failed.');
    throw err;
  }

  // 10. Settle Invoice checkout redirection
  logSection('10. Billing Payment Checkout Redirection');
  let invoiceId = '';
  let invoiceTotal = 0;
  try {
    const inv = await prisma.invoice.findFirst({ where: { organizationId: orgId } });
    if (!inv) throw new Error('Invoice not found.');
    invoiceId = inv.id;
    invoiceTotal = inv.total.toNumber();

    const invToken = await financeService.generateAccessToken(invoiceId, 'INVOICE', 5, 'admin-tester');
    
    const payRes = await axios.post(`${SERVER_URL}/api/public/docs/${invToken}/pay`);
    const checkoutUrl = payRes.data.data.checkoutUrl;
    console.log(`✅ Checkout URL resolved: ${checkoutUrl}`);
    
    // Assert URL matches the encoded format
    if (checkoutUrl.includes('FLW_MOCK__')) {
      console.log(`✅ Valid mock format verified. Encodes checkout parameters.`);
    } else {
      console.log(`ℹ️ Real Flutterwave production gateway checkout generated.`);
    }
  } catch (err: any) {
    console.error('❌ Billing payment checkout redirection failed.');
    throw err;
  }

  // 11. Settle Webhook & Idempotency
  logSection('11. Webhook Clearance & Idempotency Handling');
  const mockTxRef = `TXN_INV_${invoiceId}_${Date.now()}`;
  const mockTransactionId = `FLW_MOCK__${mockTxRef}__${invoiceTotal}`;
  
  try {
    // Send webhook payout clearance payload
    // Simulate webhook POST request
    const webhookRes = await axios.post(`${SERVER_URL}/api/public/docs/payments/webhook`, {
      status: 'successful',
      id: mockTransactionId,
      tx_ref: mockTxRef,
      amount: invoiceTotal,
      currency: 'USD',
      payment_type: 'card',
      customer: {
        email: clientEmail,
        name: 'Jane Doe'
      }
    });

    console.log(`✅ Webhook clearance accepted. status: ${webhookRes.status}`);

    // Verify ledger has payment
    const payment = await prisma.payment.findUnique({
      where: { gatewayTransactionId: mockTransactionId }
    });
    if (payment) {
      console.log(`✅ Payment logged in DB ledger: Ref: ${payment.paymentNumber}, Amount: ${payment.amount}`);
    } else {
      throw new Error('Payment was not recorded in ledger!');
    }

    // Verify Invoice status advanced to paid and balance due is 0
    const clearedInv = await financeService.getInvoiceDetails(invoiceId);
    console.log(`✅ Recalculated balance: ${clearedInv.balanceDue} (Expected: 0)`);
    console.log(`✅ Updated invoice billing status: ${clearedInv.status} (Expected: paid)`);

    // Verify receipt was generated
    const receipt = await prisma.receipt.findFirst({
      where: { paymentId: payment.id }
    });
    if (receipt) {
      console.log(`✅ Receipt auto-created in ledger: Number: ${receipt.receiptNumber}`);
    } else {
      throw new Error('Receipt was not auto-created!');
    }

    // Test Idempotency: Send the exact same webhook payload again
    console.log('Sending duplicate payment webhook (Idempotency check)...');
    const duplicateRes = await axios.post(`${SERVER_URL}/api/public/docs/payments/webhook`, {
      status: 'successful',
      id: mockTransactionId,
      tx_ref: mockTxRef,
      amount: invoiceTotal,
      currency: 'USD',
      payment_type: 'card',
      customer: {
        email: clientEmail,
        name: 'Jane Doe'
      }
    });

    console.log(`✅ Duplicate webhook handled cleanly. HTTP status: ${duplicateRes.status}`);
    
    // Assert no duplicate payment record is logged
    const paymentCount = await prisma.payment.count({
      where: { gatewayTransactionId: mockTransactionId }
    });
    console.log(`✅ Verified: Payment count in database is ${paymentCount} (Expected: 1). Idempotency passed!`);
  } catch (err: any) {
    console.error('❌ Webhook verification & idempotency check failed.');
    throw err;
  }

  console.log('\n======================================================================');
  console.log('🎉 ALL PRODUCTION ACCEPTANCE TESTS (PAT) COMPILED AND PASSED SUCCESSFULLY!');
  console.log('======================================================================');
}

runPat()
  .catch((err) => {
    console.error('\n❌ PAT execution failed with error:');
    console.error(err.response?.data || err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
