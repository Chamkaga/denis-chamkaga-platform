// src/routes/public-docs.routes.ts
// Public unauthenticated routes for viewing, responding, and checkout settlements.

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { financeService } from '../services/finance.service';
import { dpoGateway } from '../services/dpo.gateway';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';

const router = Router();

const wrap = (fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// Helper to extract client details for analytics view tracking
const getClientDetails = (req: Request) => {
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';
  
  // Extract browser and OS from user agent
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  let device = 'Desktop';
  if (userAgent.includes('Mobi') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    device = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device = 'Tablet';
  }

  let os = 'Unknown OS';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh')) os = 'macOS';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  else if (userAgent.includes('Linux')) os = 'Linux';

  return {
    ipAddress,
    userAgent,
    browser,
    device,
    os,
    country: (req.headers['cf-ipcountry'] as string) || 'TZ',
    city: 'Dar es Salaam' // mock default
  };
};

// ─── 1. Retrieve Document details ───────────────────────────────────────────
router.get('/:token', wrap(async (req, res) => {
  const { token } = req.params;
  const clientDetails = getClientDetails(req);

  // Validate token hash and increment views
  const access = await financeService.verifyAccessToken(token, clientDetails);

  // Fetch document details dynamically based on DocumentType
  let document: any = null;

  if (access.documentType === 'QUOTATION') {
    document = await prisma.quotation.findUnique({
      where: { id: access.documentId },
      include: { items: true, organization: true, responses: true }
    });
  } else if (access.documentType === 'INVOICE') {
    // Dynamic outstanding balance is loaded on invoice details
    const inv = await financeService.getInvoiceDetails(access.documentId);
    document = {
      ...inv,
      balanceDue: inv.balanceDue // calculated dynamically
    };
  } else {
    throw new AppError(400, 'BAD_REQUEST', 'Document type not supported for public link.');
  }

  if (!document) {
    throw new AppError(404, 'NOT_FOUND', 'Related document record not found.');
  }

  // Get tenant configurations
  const tenant = await prisma.tenantConfig.findFirst() || {
    name: 'Terrasafi T Ltd',
    address: 'Victoria, Dar es Salaam, Tanzania',
    email: 'finance@terrasafi.co.tz',
    phone: '+255 700 000 000'
  };

  res.json({
    success: true,
    data: {
      access: {
        id: access.id,
        documentType: access.documentType,
        expiresAt: access.expiresAt,
        currentViews: access.currentViews,
        lastViewedAt: access.lastViewedAt
      },
      document,
      tenant
    }
  });
}));

// ─── 1B. Download Document PDF ──────────────────────────────────────────────
router.get('/:token/pdf', wrap(async (req, res) => {
  const { token } = req.params;
  const clientDetails = getClientDetails(req);
  const access = await financeService.verifyAccessToken(token, clientDetails);

  let pdfBuffer: Buffer;
  let filename = 'document.pdf';

  if (access.documentType === 'QUOTATION') {
    pdfBuffer = await financeService.getQuotationPdf(access.documentId);
    const quote = await prisma.quotation.findUnique({ where: { id: access.documentId } });
    filename = quote ? `Quotation_${quote.quotationNumber}.pdf` : 'Quotation.pdf';
  } else if (access.documentType === 'INVOICE') {
    pdfBuffer = await financeService.getInvoicePdf(access.documentId);
    const inv = await prisma.invoice.findUnique({ where: { id: access.documentId } });
    filename = inv ? `Invoice_${inv.invoiceNumber}.pdf` : 'Invoice.pdf';
  } else {
    throw new AppError(400, 'BAD_REQUEST', 'PDF generation only valid for invoices and quotations.');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(pdfBuffer);
}));

// ─── 2. Quotation Customer Review responses ──────────────────────────────────
router.post('/:token/response', wrap(async (req, res) => {
  const { token } = req.params;
  const { responseType, notes, responderName, responderEmail } = req.body;

  if (!responseType || !['accepted', 'rejected', 'revision_requested'].includes(responseType)) {
    throw new AppError(400, 'BAD_REQUEST', 'Invalid response status selection.');
  }

  const clientDetails = getClientDetails(req);
  const access = await financeService.verifyAccessToken(token, clientDetails);

  if (access.documentType !== 'QUOTATION') {
    throw new AppError(400, 'BAD_REQUEST', 'Action only valid on quotation documents.');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create response logs
    const response = await tx.quotationResponse.create({
      data: {
        quotationId: access.documentId,
        responseType,
        notes,
        responderName,
        responderEmail
      }
    });

    // 2. Perform workflow triggers based on response
    if (responseType === 'accepted') {
      // Spawns project + invoice + flags others expired
      await financeService.approveQuotation(access.documentId, notes || 'Public approval', responderEmail || 'customer');
    } else {
      await tx.quotation.update({
        where: { id: access.documentId },
        data: { status: responseType === 'rejected' ? 'rejected' : 'review' }
      });
    }

    // 3. Log business timeline
    await tx.businessActivity.create({
      data: {
        action: `Quote ${responseType.replace('_', ' ').toUpperCase()}`,
        description: `Customer (${responderName || 'Representative'}) responded to Quote. Decision: ${responseType}. Notes: ${notes || 'None'}`,
        performedBy: responderEmail || 'customer'
      }
    });

    return response;
  });

  res.json({
    success: true,
    data: result,
    message: `Response logged successfully. Decision: ${responseType}`
  });
}));

// ─── 3. Initialize Payments Checkout ──────────────────────────────────────────
router.post('/:token/pay', wrap(async (req, res) => {
  const { token } = req.params;
  const clientDetails = getClientDetails(req);
  
  const access = await financeService.verifyAccessToken(token, clientDetails);

  if (access.documentType !== 'INVOICE') {
    throw new AppError(400, 'BAD_REQUEST', 'Checkout action only valid on invoice link.');
  }

  const invoice = await financeService.getInvoiceDetails(access.documentId);
  if (invoice.balanceDue <= 0) {
    throw new AppError(400, 'BAD_REQUEST', 'This invoice has already been fully paid.');
  }

  // Build client contact metadata
  const contact = await prisma.client.findFirst({ where: { organizationId: invoice.organizationId } });
  const name = contact ? `${contact.firstName} ${contact.lastName}` : 'Client Representative';
  const email = contact?.email || invoice.organization.email || 'billing@client.com';
  const phone = contact?.phone || invoice.organization.phone || undefined;

  // Initialize payment redirect link from active payment gateway
  const txRef = `TXN_INV_${invoice.id}_${Date.now()}`;
  const response = await dpoGateway.initializePayment({
    amount: invoice.balanceDue,
    currency: invoice.currency,
    txRef,
    customer: { email, phone, name },
    customizations: {
      title: 'Denis Chamkaga Brand Platform',
      description: `Payment for Invoice ${invoice.invoiceNumber}`
    },
    redirectUrl: `${env.FRONTEND_URL}/public/invoice/payment-redirect`
  });

  if (!response.success || !response.checkoutUrl) {
    throw new AppError(502, 'BAD_GATEWAY', response.message || 'Payment provider checkout failed.');
  }

  // Update invoice history
  await prisma.invoiceHistory.create({
    data: {
      invoiceId: invoice.id,
      action: 'payment_started',
      description: `Payment checkout session initialized for ${invoice.currency} ${invoice.balanceDue.toLocaleString()} (txRef: ${txRef}).`,
      performedBy: 'customer'
    }
  });

  res.json({
    success: true,
    data: {
      checkoutUrl: response.checkoutUrl
    }
  });
}));

// ─── 4. Flutterwave Webhook clearance ───────────────────────────────────────
router.post('/payments/webhook', wrap(async (req, res) => {
  // Enforce webhook verification signatures if enabled
  const localHash = env.FLW_WEBHOOK_SECRET;
  const signature = req.headers['verif-hash'];

  if (localHash && signature !== localHash) {
    console.warn('⚠️ Webhook verification hash mismatch. Request rejected.');
    res.status(401).json({ success: false, error: 'Signature verify failed.' });
    return;
  }

  const payload = req.body;
  
  if (payload.status === 'successful' || payload.event === 'charge.completed') {
    const transactionId = payload.id || payload.data?.id;
    if (transactionId) {
      console.log(`Processing verified payment webhook. Txn ID: ${transactionId}`);
      await financeService.processVerifiedPayment(transactionId.toString(), 'flutterwave');
    }
  }

  res.sendStatus(200);
}));

// ─── 5. Browser Payment Redirect verification ───────────────────────────────
router.get('/payments/verify', wrap(async (req, res) => {
  const { transaction_id } = req.query;

  if (!transaction_id) {
    throw new AppError(400, 'BAD_REQUEST', 'transaction_id is required.');
  }

  // Check ledger first
  const existing = await prisma.payment.findUnique({
    where: { gatewayTransactionId: transaction_id.toString() }
  });

  if (existing) {
    res.json({
      success: true,
      data: {
        paymentNumber: existing.paymentNumber,
        status: existing.status
      }
    });
    return;
  }

  // Otherwise perform verifying checkout query directly
  console.log(`Polling transaction verify details for ${transaction_id}`);
  const p = await financeService.processVerifiedPayment(transaction_id.toString(), 'dpo');

  res.json({
    success: true,
    data: {
      paymentNumber: p.paymentNumber,
      status: p.status
    }
  });
}));

export default router;
