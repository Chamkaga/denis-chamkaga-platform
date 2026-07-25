// src/services/finance.service.ts
// Handles ERP accounting workflows: sequences, quotations, invoices, credit notes, payments, receipts, and audit logs.

import prisma from '../config/database';
import { pdfService } from './pdf.service';
import { emailTemplateService } from './email-template.service';
import { notificationService } from './notification.service';
import { Decimal } from '@prisma/client/runtime/library';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import crypto from 'crypto';
import { DocumentType } from '@prisma/client';
import { getPaymentGateway } from './payment.gateway';
import './dpo.gateway';

export const financeService = {
  // ─── 1B. Document Access Token Management (SHA-256 Hashed) ────────────────
  async generateAccessToken(docId: string, docType: DocumentType, expiresDays = 30, createdBy?: string): Promise<string> {
    const rawToken = crypto.randomBytes(48).toString('hex'); // 96-char hex token
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    await prisma.documentAccess.create({
      data: {
        tokenHash,
        documentType: docType,
        documentId: docId,
        expiresAt,
        createdBy: createdBy || 'system'
      }
    });

    return rawToken;
  },

  async revokeAccessToken(token: string, performedBy?: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.documentAccess.update({
      where: { tokenHash },
      data: { revokedAt: new Date() }
    });

    await prisma.businessActivity.create({
      data: {
        action: 'Token Revoked',
        description: `Secure link token has been manually revoked by ${performedBy || 'system'}.`,
        performedBy: performedBy || 'system'
      }
    });
  },

  async verifyAccessToken(rawToken: string, clientDetails?: {
    ipAddress?: string;
    userAgent?: string;
    browser?: string;
    device?: string;
    os?: string;
    country?: string;
    city?: string;
  }): Promise<any> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const access = await prisma.documentAccess.findUnique({
      where: { tokenHash },
      include: { logs: true }
    });

    if (!access) throw new AppError(404, 'NOT_FOUND', 'Access link not found.');
    if (access.revokedAt) throw new AppError(403, 'FORBIDDEN', 'Access link has been revoked.');
    if (new Date() > access.expiresAt) throw new AppError(410, 'GONE', 'Access link has expired.');

    // Recalculate views count authoritative check from logs length
    const logCount = access.logs.length;
    if (logCount >= access.maxViews) {
      throw new AppError(429, 'TOO_MANY_REQUESTS', 'Maximum view count exceeded.');
    }

    // Determine if viewed before or after payment
    let viewedBeforePay = true;
    let viewedAfterPay = false;

    if (access.documentType === 'INVOICE') {
      const inv = await prisma.invoice.findUnique({ where: { id: access.documentId } });
      if (inv && (inv.status === 'paid' || inv.status === 'refunded')) {
        viewedBeforePay = false;
        viewedAfterPay = true;
      }
    }

    // Log viewer session
    await prisma.documentAccessLog.create({
      data: {
        documentAccessId: access.id,
        ipAddress: clientDetails?.ipAddress,
        userAgent: clientDetails?.userAgent,
        browser: clientDetails?.browser,
        device: clientDetails?.device,
        os: clientDetails?.os,
        country: clientDetails?.country,
        city: clientDetails?.city,
        viewedBeforePay,
        viewedAfterPay
      }
    });

    // Update count cache and lastViewedAt transactionally
    const updatedAccess = await prisma.documentAccess.update({
      where: { tokenHash },
      data: {
        currentViews: { increment: 1 },
        lastViewedAt: new Date()
      }
    });

    // Add activity log to timeline
    await prisma.businessActivity.create({
      data: {
        action: 'Document Viewed',
        description: `Public document (${access.documentType.toLowerCase()}) viewed via secure link. Device: ${clientDetails?.browser || 'Browser'} on ${clientDetails?.device || 'Device'}. Location: ${clientDetails?.city || 'Unknown'}, ${clientDetails?.country || 'Unknown'}.`,
        performedBy: 'customer'
      }
    });

    return updatedAccess;
  },

  // ─── 1. Document Sequence Generator ────────────────────────────────────────
  async getNextSequence(type: 'invoice' | 'quotation' | 'receipt' | 'contract' | 'project'): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    // Atomically increment counter
    const seq = await prisma.documentSequence.upsert({
      where: { type },
      update: {
        nextValue: { increment: 1 }
      },
      create: {
        type,
        prefix: type === 'invoice' ? 'INV' : type === 'quotation' ? 'QT' : type === 'receipt' ? 'REC' : type === 'contract' ? 'CON' : 'PRJ',
        year: currentYear,
        nextValue: 2 // Start at 2 since the current is 1
      }
    });

    const nextVal = seq.nextValue - 1; // get the value before increment
    const formattedVal = nextVal.toString().padStart(6, '0');
    return `${seq.prefix}-${currentYear}-${formattedVal}`;
  },

  // ─── 2. Quotation / Proposal Management ────────────────────────────────────
  async getQuotations(filters: { search?: string; organizationId?: string; status?: string }) {
    const where: any = {};
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { quotationNumber: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.quotation.findMany({
      where,
      include: { organization: true, items: true },
      orderBy: [{ quotationNumber: 'desc' }, { version: 'desc' }],
    });
  },

  async createQuotation(data: {
    title: string;
    organizationId: string;
    consultationId?: string;
    currency: string;
    taxRate: number;
    discountRate: number;
    validUntil: Date;
    notes?: string;
    terms?: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
  }, performedBy?: string) {
    const quotationNumber = await this.getNextSequence('quotation');

    // Calculate figures
    let subtotal = 0;
    const itemsData = data.items.map(item => {
      const itemSub = item.quantity * item.unitPrice;
      subtotal += itemSub;
      return {
        description: item.description,
        quantity: new Decimal(item.quantity),
        unitPrice: new Decimal(item.unitPrice),
        subtotal: new Decimal(itemSub)
      };
    });

    const discountAmount = subtotal * (data.discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (data.taxRate / 100);
    const total = taxableAmount + taxAmount;

    const quote = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          quotationNumber,
          version: 1,
          title: data.title,
          organizationId: data.organizationId,
          consultationId: data.consultationId,
          currency: data.currency,
          subtotal: new Decimal(subtotal),
          taxRate: new Decimal(data.taxRate),
          taxAmount: new Decimal(taxAmount),
          discountRate: new Decimal(data.discountRate),
          discountAmount: new Decimal(discountAmount),
          total: new Decimal(total),
          validUntil: data.validUntil,
          notes: data.notes,
          terms: data.terms,
          items: {
            create: itemsData
          }
        },
        include: { items: true, organization: true }
      });

      // Log financial audit log
      await tx.financialAuditLog.create({
        data: {
          action: 'quotation_created',
          documentType: 'quotation',
          documentId: q.id,
          documentNumber: `${q.quotationNumber}-V${q.version}`,
          amount: q.total,
          currency: q.currency,
          description: `Quotation ${q.quotationNumber}-V1 created for organization ${q.organization.name}`,
          performedBy: performedBy || 'system'
        }
      });

      // Log activity
      await tx.businessActivity.create({
        data: {
          action: 'Quotation Created',
          description: `Quotation ${q.quotationNumber} V1 issued to ${q.organization.name} for ${q.currency} ${q.total.toNumber().toLocaleString()}`,
          performedBy: performedBy || 'system'
        }
      });

      return q;
    });

    return quote;
  },

  // Clone quotation to V2/V3
  async cloneQuotationVersion(quoteId: string, updates?: any, performedBy?: string) {
    const origin = await prisma.quotation.findUnique({
      where: { id: quoteId },
      include: { items: true, organization: true }
    });

    if (!origin) throw new AppError(404, 'NOT_FOUND', 'Quotation not found');

    // Get max version for this quotation number
    const maxQuote = await prisma.quotation.findFirst({
      where: { quotationNumber: origin.quotationNumber },
      orderBy: { version: 'desc' }
    });

    const nextVer = (maxQuote?.version || 1) + 1;

    // Use current items as fallback or update them
    const activeItems = updates?.items || origin.items.map(i => ({
      description: i.description,
      quantity: i.quantity.toNumber(),
      unitPrice: i.unitPrice.toNumber()
    }));

    let subtotal = 0;
    const itemsData = activeItems.map((item: any) => {
      const itemSub = item.quantity * item.unitPrice;
      subtotal += itemSub;
      return {
        description: item.description,
        quantity: new Decimal(item.quantity),
        unitPrice: new Decimal(item.unitPrice),
        subtotal: new Decimal(itemSub)
      };
    });

    const taxRate = updates?.taxRate !== undefined ? updates.taxRate : origin.taxRate.toNumber();
    const discountRate = updates?.discountRate !== undefined ? updates.discountRate : origin.discountRate.toNumber();
    const currency = updates?.currency || origin.currency;

    const discountAmount = subtotal * (discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    const cloned = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          quotationNumber: origin.quotationNumber,
          version: nextVer,
          title: updates?.title || origin.title,
          organizationId: origin.organizationId,
          consultationId: origin.consultationId,
          currency,
          subtotal: new Decimal(subtotal),
          taxRate: new Decimal(taxRate),
          taxAmount: new Decimal(taxAmount),
          discountRate: new Decimal(discountRate),
          discountAmount: new Decimal(discountAmount),
          total: new Decimal(total),
          validUntil: updates?.validUntil ? new Date(updates.validUntil) : origin.validUntil,
          notes: updates?.notes || origin.notes,
          terms: updates?.terms || origin.terms,
          items: {
            create: itemsData
          }
        },
        include: { items: true, organization: true }
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'quotation_cloned',
          documentType: 'quotation',
          documentId: q.id,
          documentNumber: `${q.quotationNumber}-V${q.version}`,
          amount: q.total,
          currency: q.currency,
          description: `Quotation version cloned to V${q.version} for ${q.quotationNumber}`,
          performedBy: performedBy || 'system'
        }
      });

      await tx.businessActivity.create({
        data: {
          action: 'Quotation Revised',
          description: `Revised quotation version V${q.version} generated for ${q.quotationNumber}`,
          performedBy: performedBy || 'system'
        }
      });

      return q;
    });

    return cloned;
  },

  // Approve Quotation (instantly spawns Project and snapshotted Invoice)
  async approveQuotation(quoteId: string, approvalNotes?: string, performedBy?: string) {
    const quote = await prisma.quotation.findUnique({
      where: { id: quoteId },
      include: { items: true, organization: true }
    });

    if (!quote) throw new AppError(404, 'NOT_FOUND', 'Quotation not found');
    if (quote.status === 'approved') throw new AppError(400, 'BAD_REQUEST', 'Quotation is already approved');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Approve this version
      const approvedQuote = await tx.quotation.update({
        where: { id: quoteId },
        data: {
          status: 'approved',
          approvedAt: new Date(),
          approvalNotes
        }
      });

      // 2. Terminate all other versions of this quote
      await tx.quotation.updateMany({
        where: {
          quotationNumber: quote.quotationNumber,
          id: { not: quoteId }
        },
        data: {
          status: 'expired'
        }
      });

      // 3. Create a Project
      const projectNumber = await this.getNextSequence('project');
      const slug = `prj-${quote.quotationNumber.toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;
      const project = await tx.project.create({
        data: {
          title: quote.title,
          slug,
          description: `Client project spawned from approved quote ${quote.quotationNumber}`,
          content: `Project details spawned automatically from quote ${quote.quotationNumber}. Approved notes: ${approvalNotes || 'None'}.`,
          techStack: JSON.stringify([]),
          category: 'consulting',
          status: 'planned',
          organizationId: quote.organizationId,
          createdById: (await tx.user.findFirst({ where: { role: { name: 'super_admin' } } }))?.id || 'admin-id'
        }
      });

      // Update Quotation with Project link
      await tx.quotation.update({
        where: { id: quoteId },
        data: { projectId: project.id }
      });

      // 4. Create initial snapshotted Invoice
      const invoiceNumber = await this.getNextSequence('invoice');
      
      // Snapshot items
      const invoiceItems = quote.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal
      }));

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          organizationId: quote.organizationId,
          quotationId: quote.id,
          projectId: project.id,
          status: 'draft',
          currency: quote.currency,
          subtotal: quote.subtotal,
          taxRate: quote.taxRate,
          taxAmount: quote.taxAmount,
          discountRate: quote.discountRate,
          discountAmount: quote.discountAmount,
          total: quote.total,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30 default
          paymentTerms: 'Net 30',
          items: {
            create: invoiceItems
          }
        },
        include: { items: true }
      });

      // Audit logs
      await tx.financialAuditLog.create({
        data: {
          action: 'quotation_approved',
          documentType: 'quotation',
          documentId: quote.id,
          documentNumber: `${quote.quotationNumber}-V${quote.version}`,
          amount: quote.total,
          currency: quote.currency,
          description: `Quotation ${quote.quotationNumber}-V${quote.version} approved by customer.`,
          performedBy: performedBy || 'system'
        }
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'invoice_generated',
          documentType: 'invoice',
          documentId: invoice.id,
          documentNumber: invoice.invoiceNumber,
          amount: invoice.total,
          currency: invoice.currency,
          description: `Invoice ${invoice.invoiceNumber} generated from quotation ${quote.quotationNumber}`,
          performedBy: performedBy || 'system'
        }
      });

      // Log business activities
      await tx.businessActivity.create({
        data: {
          action: 'Quotation Approved',
          description: `Client approved Quotation ${quote.quotationNumber} V${quote.version}`,
          performedBy: performedBy || 'system'
        }
      });

      await tx.businessActivity.create({
        data: {
          action: 'Project Started',
          description: `Client Project "${quote.title}" successfully launched. Ref: ${projectNumber}`,
          performedBy: performedBy || 'system'
        }
      });

      // Centralized notification triggers
      notificationService.notifyAdmins({
        type: 'client_quote_approval',
        title: 'Quotation Approved',
        message: `Client organization ${quote.organization.name} approved quote ${quote.quotationNumber}-V${quote.version}.`,
        actionUrl: `/admin/business`
      });

      return { approvedQuote, project, invoice };
    });

    return result;
  },

  // ─── 3. Invoice & Billing Management ───────────────────────────────────────
  async getInvoices(filters: { search?: string; organizationId?: string; status?: string }) {
    const where: any = {};
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        organization: true,
        items: true,
        payments: { where: { status: 'successful' } },
        creditNotes: { where: { status: 'issued' } }
      },
      orderBy: { invoiceNumber: 'desc' }
    });

    // Compute balance dynamically
    return invoices.map(inv => {
      const totalPaid = inv.payments.reduce((acc, p) => acc + p.amount.toNumber(), 0);
      const totalCredited = inv.creditNotes.reduce((acc, c) => acc + c.amount.toNumber(), 0);
      const balanceDue = Math.max(0, inv.total.toNumber() - totalPaid - totalCredited);
      return {
        ...inv,
        totalPaid,
        totalCredited,
        balanceDue
      };
    });
  },

  async getInvoiceDetails(invoiceId: string) {
    const inv = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        organization: true,
        items: true,
        payments: true,
        creditNotes: true,
        history: true
      }
    });

    if (!inv) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');

    const successfulPayments = inv.payments.filter(p => p.status === 'successful');
    const issuedCreditNotes = inv.creditNotes.filter(c => c.status === 'issued');

    const totalPaid = successfulPayments.reduce((acc, p) => acc + p.amount.toNumber(), 0);
    const totalCredited = issuedCreditNotes.reduce((acc, c) => acc + c.amount.toNumber(), 0);
    const balanceDue = Math.max(0, inv.total.toNumber() - totalPaid - totalCredited);

    return {
      ...inv,
      totalPaid,
      totalCredited,
      balanceDue
    };
  },

  // Manual Invoice Creator (if needed, but usually generated from Quote)
  async createInvoice(data: {
    organizationId: string;
    currency: string;
    taxRate: number;
    discountRate: number;
    dueDate: Date;
    paymentTerms?: string;
    notes?: string;
    isRecurring?: boolean;
    billingFrequency?: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
  }, performedBy?: string) {
    const invoiceNumber = await this.getNextSequence('invoice');

    let subtotal = 0;
    const itemsData = data.items.map(item => {
      const itemSub = item.quantity * item.unitPrice;
      subtotal += itemSub;
      return {
        description: item.description,
        quantity: new Decimal(item.quantity),
        unitPrice: new Decimal(item.unitPrice),
        subtotal: new Decimal(itemSub)
      };
    });

    const discountAmount = subtotal * (data.discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (data.taxRate / 100);
    const total = taxableAmount + taxAmount;

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          organizationId: data.organizationId,
          status: 'draft',
          currency: data.currency,
          subtotal: new Decimal(subtotal),
          taxRate: new Decimal(data.taxRate),
          taxAmount: new Decimal(taxAmount),
          discountRate: new Decimal(data.discountRate),
          discountAmount: new Decimal(discountAmount),
          total: new Decimal(total),
          dueDate: data.dueDate,
          paymentTerms: data.paymentTerms,
          notes: data.notes,
          isRecurring: data.isRecurring || false,
          billingFrequency: data.billingFrequency,
          items: {
            create: itemsData
          }
        },
        include: { items: true, organization: true }
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'invoice_created',
          documentType: 'invoice',
          documentId: inv.id,
          documentNumber: inv.invoiceNumber,
          amount: inv.total,
          currency: inv.currency,
          description: `Invoice ${inv.invoiceNumber} created for ${inv.organization.name}`,
          performedBy: performedBy || 'system'
        }
      });

      return inv;
    });

    return invoice;
  },

  // Update status (e.g. approve draft, mark sent, view)
  async updateInvoiceStatus(invoiceId: string, status: string, performedBy?: string) {
    const allowed = ['draft', 'approved', 'sent', 'viewed', 'cancelled'];
    if (!allowed.includes(status)) {
      throw new AppError(400, 'BAD_REQUEST', `Cannot manually set status to: ${status}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status }
      });

      await tx.invoiceHistory.create({
        data: {
          invoiceId,
          action: 'status_change',
          description: `Invoice status advanced to ${status}`,
          performedBy
        }
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'invoice_status_changed',
          documentType: 'invoice',
          documentId: inv.id,
          documentNumber: inv.invoiceNumber,
          description: `Invoice ${inv.invoiceNumber} status set to ${status}`,
          performedBy
        }
      });

      return inv;
    });

    return updated;
  },

  // ─── 4. Credit Notes ───────────────────────────────────────────────────────
  async createCreditNote(invoiceId: string, amount: number, reason: string, performedBy?: string) {
    const inv = await this.getInvoiceDetails(invoiceId);
    
    if (amount > inv.balanceDue) {
      throw new AppError(400, 'BAD_REQUEST', `Credit note amount (${amount}) exceeds remaining balance due (${inv.balanceDue})`);
    }

    const creditNoteNumber = await this.getNextSequence('contract').then(n => n.replace('CON', 'CN')); // CN-XXXXXX

    const creditNote = await prisma.$transaction(async (tx) => {
      const cn = await tx.creditNote.create({
        data: {
          creditNoteNumber,
          invoiceId,
          amount: new Decimal(amount),
          currency: inv.currency,
          reason,
          status: 'issued'
        }
      });

      // Update invoice status if balance becomes 0
      const totalPaid = inv.payments.filter(p => p.status === 'successful').reduce((acc, p) => acc + p.amount.toNumber(), 0);
      const newTotalCredited = inv.creditNotes.filter(c => c.status === 'issued').reduce((acc, c) => acc + c.amount.toNumber(), 0) + amount;
      const newBalance = Math.max(0, inv.total.toNumber() - totalPaid - newTotalCredited);
      
      let nextStatus = inv.status;
      if (newBalance === 0) {
        nextStatus = 'paid';
      } else if (totalPaid > 0 || newTotalCredited > 0) {
        nextStatus = 'partially_paid';
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: nextStatus }
      });

      await tx.invoiceHistory.create({
        data: {
          invoiceId,
          action: 'credit_note_issued',
          description: `Credit note ${creditNoteNumber} issued for ${inv.currency} ${amount.toLocaleString()}. Reason: ${reason}`,
          performedBy
        }
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'credit_note_issued',
          documentType: 'credit_note',
          documentId: cn.id,
          documentNumber: cn.creditNoteNumber,
          amount: cn.amount,
          currency: cn.currency,
          description: `Credit note ${cn.creditNoteNumber} issued for invoice ${inv.invoiceNumber}.`,
          performedBy
        }
      });

      // Timeline log
      await tx.businessActivity.create({
        data: {
          action: 'Credit Note Issued',
          description: `Credit Note ${cn.creditNoteNumber} issued to adjust Invoice ${inv.invoiceNumber} for ${inv.currency} ${amount.toLocaleString()}`,
          performedBy
        }
      });

      return cn;
    });

    return creditNote;
  },

  // ─── 5. Payment & Receipt Ledger ──────────────────────────────────────────
  async recordPayment(invoiceId: string, details: {
    amount: number;
    method: string;
    phoneNumber?: string;
    cardNumber?: string;
    email?: string;
    reference?: string;
  }, performedBy?: string) {
    const inv = await this.getInvoiceDetails(invoiceId);

    if (details.amount <= 0) {
      throw new AppError(400, 'BAD_REQUEST', 'Payment amount must be greater than zero');
    }
    if (details.amount > inv.balanceDue) {
      throw new AppError(400, 'BAD_REQUEST', `Payment amount (${details.amount}) exceeds outstanding balance due (${inv.balanceDue})`);
    }

    const paymentNumber = await this.getNextSequence('receipt').then(n => n.replace('REC', 'PAY')); // PAY-XXXXXX
    const receiptNumber = await this.getNextSequence('receipt'); // REC-XXXXXX

    const payment = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record in ledger
      const p = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId,
          amount: new Decimal(details.amount),
          currency: inv.currency,
          gatewayName: details.method,
          gatewayTransactionId: `MANUAL_${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
          gatewayPayload: { type: 'manual_entry', reference: details.reference || 'N/A' },
          rawResponse: { type: 'manual_entry', reference: details.reference || 'N/A' },
          gatewayProvider: 'manual',
          gatewayReference: details.reference || undefined,
          verifiedAt: new Date(),
          paymentChannel: details.method,
          exchangeRate: new Decimal(1.0000),
          fees: new Decimal(0.00),
          customerEmail: details.email || undefined,
          status: 'successful',
          notes: details.reference ? `Manual Entry Ref: ${details.reference}` : undefined
        }
      });

      // 2. Calculate new invoice balance & update status
      const totalPaid = inv.payments.filter(pay => pay.status === 'successful').reduce((acc, pay) => acc + pay.amount.toNumber(), 0) + details.amount;
      const totalCredited = inv.creditNotes.filter(c => c.status === 'issued').reduce((acc, c) => acc + c.amount.toNumber(), 0);
      const newBalance = Math.max(0, inv.total.toNumber() - totalPaid - totalCredited);

      let nextStatus = 'partially_paid';
      if (newBalance === 0) {
        nextStatus = 'paid';
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: nextStatus }
      });

      // 3. Create Receipt
      await tx.receipt.create({
        data: {
          receiptNumber,
          paymentId: p.id,
          status: 'generated'
        }
      });

      // 4. Log Invoice History
      await tx.invoiceHistory.create({
        data: {
          invoiceId,
          action: 'payment_received',
          description: `Manual payment of ${inv.currency} ${details.amount.toLocaleString()} recorded. Status updated to ${nextStatus}.`,
          performedBy
        }
      });

      // 5. Immutable Financial Audit Logs
      await tx.financialAuditLog.create({
        data: {
          action: 'payment_received',
          documentType: 'payment',
          documentId: p.id,
          documentNumber: p.paymentNumber,
          amount: p.amount,
          currency: p.currency,
          description: `Payment ${p.paymentNumber} manually logged on invoice ${inv.invoiceNumber}.`,
          performedBy
        }
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'receipt_generated',
          documentType: 'receipt',
          documentId: receiptNumber,
          documentNumber: receiptNumber,
          amount: p.amount,
          currency: p.currency,
          description: `Receipt ${receiptNumber} generated for payment ${p.paymentNumber}`,
          performedBy
        }
      });

      // 6. Organization activity log
      await tx.businessActivity.create({
        data: {
          action: 'Payment Received',
          description: `Payment of ${inv.currency} ${details.amount.toLocaleString()} settled manually against Invoice ${inv.invoiceNumber}. Receipt issued: ${receiptNumber}`,
          performedBy
        }
      });

      // Trigger admin alert
      notificationService.notifyAdmins({
        type: 'payment_received',
        title: 'Manual Payment Logged',
        message: `Payment of ${inv.currency} ${details.amount.toLocaleString()} logged manually for ${inv.organization.name} on invoice ${inv.invoiceNumber}.`,
        actionUrl: `/admin/business`
      });

      return p;
    });

    // Send receipt email asynchronously
    const clientEmail = inv.organization.email || (await prisma.client.findFirst({ where: { organizationId: inv.organizationId } }))?.email;
    if (clientEmail) {
      this.getReceiptPdfByNumber(receiptNumber)
        .then(pdf => emailTemplateService.sendReceipt(clientEmail, inv.organization.name, receiptNumber, `${inv.currency} ${details.amount.toLocaleString()}`, details.method, pdf))
        .catch(err => console.error('Failed to automatically email payment receipt:', err));
    }

    return payment;
  },

  // ─── 6. PDF Rendering Helpers ──────────────────────────────────────────────
  async getInvoicePdf(invoiceId: string): Promise<Buffer> {
    const inv = await this.getInvoiceDetails(invoiceId);
    const tenant = await prisma.tenantConfig.findFirst() || {
      name: 'Terrasafi T Ltd',
      address: 'Victoria, Dar es Salaam, Tanzania',
      email: 'finance@terrasafi.co.tz',
      phone: '+255 700 000 000',
      vatNumber: '100-200-300'
    };

    const tenantData = {
      name: tenant.name,
      address: tenant.address || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      vatNumber: tenant.vatNumber || undefined
    };

    const contactName = (await prisma.client.findFirst({ where: { organizationId: inv.organizationId } }))
      ? `${(await prisma.client.findFirst({ where: { organizationId: inv.organizationId } }))?.firstName} ${(await prisma.client.findFirst({ where: { organizationId: inv.organizationId } }))?.lastName}`
      : 'Finance Officer';

    return pdfService.generate({
      title: 'INVOICE',
      number: inv.invoiceNumber,
      date: inv.issueDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      status: inv.status,
      currency: inv.currency,
      tenant: tenantData,
      customer: {
        companyName: inv.organization.name,
        contactName,
        email: inv.organization.email || 'billing@client.com',
        address: inv.organization.address || undefined
      },
      items: inv.items.map(i => ({
        description: i.description,
        quantity: i.quantity.toNumber(),
        unitPrice: i.unitPrice.toNumber(),
        subtotal: i.subtotal.toNumber()
      })),
      subtotal: inv.subtotal.toNumber(),
      taxRate: inv.taxRate.toNumber(),
      taxAmount: inv.taxAmount.toNumber(),
      discountAmount: inv.discountAmount.toNumber(),
      total: inv.total.toNumber(),
      balanceDue: inv.balanceDue,
      notes: inv.notes || undefined,
      terms: 'Payments must be completed within the listed due date via M-Pesa, card, or direct bank transfer.'
    });
  },

  async getQuotationPdf(quoteId: string): Promise<Buffer> {
    const quote = await prisma.quotation.findUnique({
      where: { id: quoteId },
      include: { items: true, organization: true }
    });
    if (!quote) throw new AppError(404, 'NOT_FOUND', 'Quotation not found');

    const tenant = await prisma.tenantConfig.findFirst() || {
      name: 'Terrasafi T Ltd',
      address: 'Victoria, Dar es Salaam, Tanzania',
      email: 'finance@terrasafi.co.tz',
      phone: '+255 700 000 000',
      vatNumber: '100-200-300'
    };

    const tenantData = {
      name: tenant.name,
      address: tenant.address || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      vatNumber: tenant.vatNumber || undefined
    };

    const contactName = (await prisma.client.findFirst({ where: { organizationId: quote.organizationId } }))
      ? `${(await prisma.client.findFirst({ where: { organizationId: quote.organizationId } }))?.firstName} ${(await prisma.client.findFirst({ where: { organizationId: quote.organizationId } }))?.lastName}`
      : 'ICT Officer';

    return pdfService.generate({
      title: 'QUOTATION',
      number: `${quote.quotationNumber}-V${quote.version}`,
      date: quote.createdAt.toISOString(),
      dueDate: quote.validUntil.toISOString(),
      status: quote.status,
      currency: quote.currency,
      tenant: tenantData,
      customer: {
        companyName: quote.organization.name,
        contactName,
        email: quote.organization.email || 'info@client.com',
        address: quote.organization.address || undefined
      },
      items: quote.items.map(i => ({
        description: i.description,
        quantity: i.quantity.toNumber(),
        unitPrice: i.unitPrice.toNumber(),
        subtotal: i.subtotal.toNumber()
      })),
      subtotal: quote.subtotal.toNumber(),
      taxRate: quote.taxRate.toNumber(),
      taxAmount: quote.taxAmount.toNumber(),
      discountAmount: quote.discountAmount.toNumber(),
      total: quote.total.toNumber(),
      notes: quote.notes || undefined,
      terms: quote.terms || 'This quotation remains valid until the date listed above. Development begins upon formal signature approval.'
    });
  },

  async getReceiptPdfByNumber(receiptNumber: string): Promise<Buffer> {
    const rec = await prisma.receipt.findUnique({
      where: { receiptNumber },
      include: { payment: { include: { invoice: { include: { organization: true } } } } }
    });
    if (!rec) throw new AppError(404, 'NOT_FOUND', 'Receipt not found');

    const tenant = await prisma.tenantConfig.findFirst() || {
      name: 'Terrasafi T Ltd',
      address: 'Victoria, Dar es Salaam, Tanzania',
      email: 'finance@terrasafi.co.tz',
      phone: '+255 700 000 000',
      vatNumber: '100-200-300'
    };

    const tenantData = {
      name: tenant.name,
      address: tenant.address || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      vatNumber: tenant.vatNumber || undefined
    };

    let contactName = 'Representative';
    let customerCompanyName = 'Individual Sponsor';
    let customerEmail = rec.payment.customerEmail || 'billing@client.com';
    let customerAddress: string | undefined = undefined;
    let itemDescription = `Direct donation support payment. Method: ${rec.payment.gatewayName.toUpperCase()}. Ref: ${rec.payment.gatewayTransactionId || 'N/A'}`;

    if (rec.payment.invoice) {
      const dbContact = await prisma.client.findFirst({ where: { organizationId: rec.payment.invoice.organizationId } });
      if (dbContact) {
        contactName = `${dbContact.firstName} ${dbContact.lastName}`;
      }
      customerCompanyName = rec.payment.invoice.organization.name;
      customerEmail = rec.payment.invoice.organization.email || 'billing@client.com';
      customerAddress = rec.payment.invoice.organization.address || undefined;
      itemDescription = `Payment settled against Invoice ${rec.payment.invoice.invoiceNumber}. Method: ${rec.payment.gatewayName.toUpperCase()}. Ref: ${rec.payment.gatewayTransactionId || 'N/A'}`;
    } else {
      if (rec.payment.notes) {
        contactName = rec.payment.notes;
      }
    }

    return pdfService.generate({
      title: 'RECEIPT',
      number: rec.receiptNumber,
      date: rec.issuedAt.toISOString(),
      status: 'completed',
      currency: rec.payment.currency,
      tenant: tenantData,
      customer: {
        companyName: customerCompanyName,
        contactName,
        email: customerEmail,
        address: customerAddress
      },
      items: [
        {
          description: itemDescription,
          quantity: 1,
          unitPrice: rec.payment.amount.toNumber(),
          subtotal: rec.payment.amount.toNumber()
        }
      ],
      subtotal: rec.payment.amount.toNumber(),
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: rec.payment.amount.toNumber(),
      notes: rec.payment.notes || undefined,
      terms: 'Thank you for your business. This document serves as confirmation of payment receipt.'
    });
  },

  // ─── 7. Communication Dispatches ───────────────────────────────────────────
  async sendInvoiceEmail(invoiceId: string, performedBy?: string) {
    const inv = await this.getInvoiceDetails(invoiceId);
    const clientEmail = inv.organization.email || (await prisma.client.findFirst({ where: { organizationId: inv.organizationId } }))?.email;

    if (!clientEmail) {
      throw new AppError(400, 'BAD_REQUEST', 'No email address registered for this client organization.');
    }

    const pdfBuffer = await this.getInvoicePdf(invoiceId);
    const rawToken = await this.generateAccessToken(invoiceId, 'INVOICE', 30, performedBy);
    const publicUrl = `${env.FRONTEND_URL}/public/invoice/${rawToken}`;

    const success = await emailTemplateService.sendInvoice(
      clientEmail,
      inv.organization.name,
      inv.invoiceNumber,
      `${inv.currency} ${inv.total.toNumber().toLocaleString()}`,
      inv.dueDate.toISOString(),
      publicUrl,
      pdfBuffer
    );

    if (success) {
      await prisma.$transaction(async (tx) => {
        await tx.invoiceHistory.create({
          data: {
            invoiceId,
            action: 'email_sent',
            description: `Invoice emailed to ${clientEmail} with secure public checkout link.`,
            performedBy
          }
        });
        
        await tx.financialAuditLog.create({
          data: {
            action: 'invoice_emailed',
            documentType: 'invoice',
            documentId: inv.id,
            documentNumber: inv.invoiceNumber,
            description: `Invoice emailed to ${clientEmail} with secure public checkout link.`,
            performedBy
          }
        });
      });
    }

    return success;
  },

  async sendQuotationEmail(quoteId: string, performedBy?: string) {
    const quote = await prisma.quotation.findUnique({
      where: { id: quoteId },
      include: { organization: true }
    });
    if (!quote) throw new AppError(404, 'NOT_FOUND', 'Quotation not found');

    const clientEmail = quote.organization.email || (await prisma.client.findFirst({ where: { organizationId: quote.organizationId } }))?.email;
    if (!clientEmail) {
      throw new AppError(400, 'BAD_REQUEST', 'No email address registered for this client organization.');
    }

    const pdfBuffer = await this.getQuotationPdf(quoteId);
    const rawToken = await this.generateAccessToken(quoteId, 'QUOTATION', 30, performedBy);
    const publicUrl = `${env.FRONTEND_URL}/public/quotation/${rawToken}`;

    const success = await emailTemplateService.sendQuotation(
      clientEmail,
      quote.organization.name,
      quote.quotationNumber,
      `${quote.currency} ${quote.total.toNumber().toLocaleString()}`,
      publicUrl,
      pdfBuffer
    );

    if (success) {
      await prisma.businessActivity.create({
        data: {
          action: 'Quotation Sent',
          description: `Quotation ${quote.quotationNumber}-V${quote.version} sent to client email ${clientEmail}. Secure public link generated.`,
          performedBy: performedBy || 'system'
        }
      });
    }

    return success;
  },

  async processVerifiedPayment(transactionId: string, gatewayName = 'flutterwave') {
    // Idempotency check: see if we already have this gatewayTransactionId in our payments table
    const existingPayment = await prisma.payment.findUnique({
      where: { gatewayTransactionId: transactionId }
    });
    if (existingPayment) {
      console.log(`Payment with transactionId ${transactionId} already processed (Idempotent).`);
      return existingPayment;
    }

    const gateway = getPaymentGateway(gatewayName);
    const result = await gateway.verifyPayment(transactionId);
    if (!result.success || !result.data) {
      throw new AppError(400, 'BAD_REQUEST', result.message || 'Payment verification returned failure');
    }

    const txn = result.data;
    
    // Find the invoice based on transaction reference
    const isSupport = txn.reference.startsWith('TXN_SUP_');
    let invoiceId: string | null = null;
    let inv: any = null;

    if (!isSupport) {
      if (txn.reference.startsWith('TXN_INV_')) {
        invoiceId = txn.reference.split('_')[2];
      } else {
        const invByRef = await prisma.invoice.findFirst({
          where: { invoiceNumber: txn.reference }
        });
        if (invByRef) {
          invoiceId = invByRef.id;
        }
      }

      if (!invoiceId) {
        const checkInv = await prisma.invoice.findUnique({ where: { id: txn.reference } });
        if (checkInv) {
          invoiceId = checkInv.id;
        } else {
          throw new AppError(404, 'NOT_FOUND', `Could not map payment reference ${txn.reference} to an invoice.`);
        }
      }
      inv = await this.getInvoiceDetails(invoiceId);
    }

    const paymentNumber = await this.getNextSequence('receipt').then(n => n.replace('REC', 'PAY')); // PAY-XXXXXX
    const receiptNumber = await this.getNextSequence('receipt'); // REC-XXXXXX

    const payment = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record in ledger
      const p = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId,
          paymentType: isSupport ? 'support' : 'invoice',
          amount: new Decimal(txn.amount),
          currency: txn.currency,
          gatewayName: txn.provider,
          gatewayTransactionId: txn.transactionId,
          gatewayPayload: txn.payload,
          rawResponse: txn.payload,
          gatewayProvider: txn.provider,
          gatewayReference: txn.reference,
          verifiedAt: txn.verifiedAt,
          paymentChannel: txn.paymentChannel,
          exchangeRate: new Decimal(1.0000),
          fees: new Decimal(txn.fees),
          customerEmail: txn.customerEmail,
          customerPhone: txn.customerPhone,
          status: 'successful',
          notes: isSupport ? 'Support Donation via DPO Pay' : `Webhook verification checkout. Channel: ${txn.paymentChannel}`
        }
      });

      if (!isSupport && invoiceId && inv) {
        // 2. Recalculate invoice balance and update status
        const totalPaid = inv.payments.filter((pay: any) => pay.status === 'successful').reduce((acc: number, pay: any) => acc + pay.amount.toNumber(), 0) + txn.amount;
        const totalCredited = inv.creditNotes.filter((c: any) => c.status === 'issued').reduce((acc: number, c: any) => acc + c.amount.toNumber(), 0);
        const newBalance = Math.max(0, inv.total.toNumber() - totalPaid - totalCredited);

        let nextStatus = 'partially_paid';
        if (newBalance === 0) {
          nextStatus = 'paid';
        }

        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: nextStatus }
        });

        // 3. Create Receipt
        await tx.receipt.create({
          data: {
            receiptNumber,
            paymentId: p.id,
            status: 'generated'
          }
        });

        // 4. Log Invoice History
        await tx.invoiceHistory.create({
          data: {
            invoiceId,
            action: 'payment_received',
            description: `Payment of ${txn.currency} ${txn.amount.toLocaleString()} cleared via Webhook (${txn.paymentChannel.toUpperCase()}). Status updated to ${nextStatus}.`,
            performedBy: 'system'
          }
        });

        // 5. Audit logs
        await tx.financialAuditLog.create({
          data: {
            action: 'payment_received',
            documentType: 'payment',
            documentId: p.id,
            documentNumber: p.paymentNumber,
            amount: p.amount,
            currency: p.currency,
            description: `Payment ${p.paymentNumber} verified on invoice ${inv.invoiceNumber} via ${txn.provider} (ref: ${txn.reference})`,
            performedBy: 'system'
          }
        });

        await tx.financialAuditLog.create({
          data: {
            action: 'receipt_generated',
            documentType: 'receipt',
            documentId: receiptNumber,
            documentNumber: receiptNumber,
            amount: p.amount,
            currency: p.currency,
            description: `Receipt ${receiptNumber} generated for payment ${p.paymentNumber}`,
            performedBy: 'system'
          }
        });

        // 6. Organization activity timeline
        await tx.businessActivity.create({
          data: {
            action: 'Payment Received',
            description: `Payment of ${inv.currency} ${txn.amount.toLocaleString()} settled against Invoice ${inv.invoiceNumber}. Receipt generated: ${receiptNumber}`,
            performedBy: 'system'
          }
        });

        // Timeline alert
        notificationService.notifyAdmins({
          type: 'payment_received',
          title: 'Webhook Payment Confirmed',
          message: `Payment of ${inv.currency} ${txn.amount.toLocaleString()} verified for ${inv.organization.name} for invoice ${inv.invoiceNumber}.`,
          actionUrl: `/admin/business`
        });
      } else {
        // Support donation audit & alerts
        await tx.financialAuditLog.create({
          data: {
            action: 'payment_received',
            documentType: 'payment',
            documentId: p.id,
            documentNumber: p.paymentNumber,
            amount: p.amount,
            currency: p.currency,
            description: `Donation Payment ${p.paymentNumber} of ${p.currency} ${p.amount.toLocaleString()} verified via DPO (ref: ${txn.reference})`,
            performedBy: 'system'
          }
        });

        // Timeline alert
        notificationService.notifyAdmins({
          type: 'payment_received',
          title: 'Support Donation Received',
          message: `Donation payment of ${p.currency} ${p.amount.toLocaleString()} received from ${p.customerEmail || 'Anonymous donor'}.`,
          actionUrl: `/admin/business`
        });
      }

      return p;
    });

    // Send receipt email asynchronously (only for invoice payments)
    if (!isSupport && inv) {
      const clientEmail = inv.organization.email || (await prisma.client.findFirst({ where: { organizationId: inv.organizationId } }))?.email;
      if (clientEmail) {
        this.getReceiptPdfByNumber(receiptNumber)
          .then(pdf => emailTemplateService.sendReceipt(
            clientEmail, 
            inv.organization.name, 
            receiptNumber, 
            `${inv.currency} ${txn.amount.toLocaleString()}`, 
            txn.paymentChannel, 
            pdf
          ))
          .catch(err => console.error('Failed to automatically email payment receipt:', err));
      }
    }

    return payment;
  },

  // ─── 7. Enterprise Double-Entry Accounting Engine & ERP ──────────────────
  async seedDefaultChartOfAccounts() {
    const defaultAccounts = [
      { accountCode: '1010', name: 'Cash & Bank (TZS)', category: 'ASSET_CURRENT', currency: 'TZS' },
      { accountCode: '1020', name: 'Cash & Bank (USD)', category: 'ASSET_CURRENT', currency: 'USD' },
      { accountCode: '1200', name: 'Accounts Receivable', category: 'ASSET_CURRENT', currency: 'TZS' },
      { accountCode: '2000', name: 'Accounts Payable', category: 'LIABILITY_CURRENT', currency: 'TZS' },
      { accountCode: '3000', name: 'Owners Equity', category: 'EQUITY', currency: 'TZS' },
      { accountCode: '4000', name: 'Project & Services Revenue', category: 'REVENUE', currency: 'TZS' },
      { accountCode: '4100', name: 'Vision Supporters Revenue', category: 'REVENUE', currency: 'TZS' },
      { accountCode: '5000', name: 'Infrastructure & Server Expenses', category: 'EXPENSE', currency: 'TZS' },
      { accountCode: '5010', name: 'DPO Gateway Merchant Fee Expense', category: 'EXPENSE', currency: 'TZS' },
      { accountCode: '5020', name: 'Bank Wire & Transfer Charge Expense', category: 'EXPENSE', currency: 'TZS' },
      { accountCode: '5100', name: 'Salaries & Professional Fees', category: 'EXPENSE', currency: 'TZS' },
      { accountCode: '5200', name: 'Marketing & Communication Expenses', category: 'EXPENSE', currency: 'TZS' },
      { accountCode: '5300', name: 'Office & Operational Expenses', category: 'EXPENSE', currency: 'TZS' },
    ];

    for (const acc of defaultAccounts) {
      await prisma.chartOfAccount.upsert({
        where: { accountCode: acc.accountCode },
        update: { name: acc.name, category: acc.category as any, currency: acc.currency as any },
        create: {
          accountCode: acc.accountCode,
          name: acc.name,
          category: acc.category as any,
          currency: acc.currency as any,
          isSystem: true
        }
      });
    }
  },

  async getChartOfAccounts() {
    await this.seedDefaultChartOfAccounts();
    return prisma.chartOfAccount.findMany({
      orderBy: { accountCode: 'asc' }
    });
  },

  async postJournalEntry(data: {
    description: string;
    sourceModule: string;
    eventTrigger?: string;
    reference?: string;
    performedBy?: string;
    lines: Array<{
      accountCode: string;
      type: 'DEBIT' | 'CREDIT';
      amount: number;
      currency?: 'TZS' | 'USD';
      exchangeRate?: number;
      description?: string;
    }>;
  }) {
    await this.seedDefaultChartOfAccounts();

    let totalDebits = 0;
    let totalCredits = 0;

    for (const l of data.lines) {
      if (l.type === 'DEBIT') totalDebits += Number(l.amount);
      if (l.type === 'CREDIT') totalCredits += Number(l.amount);
    }

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new AppError(400, 'UNBALANCED_JOURNAL', `Debits (${totalDebits}) must equal Credits (${totalCredits}).`);
    }

    const currentYear = new Date().getFullYear();
    const entrySeq = await this.getNextSequence('invoice'); // reuse sequence counter pattern
    const entryNumber = `JRN-${currentYear}-${entrySeq.split('-').pop()}`;

    return prisma.$transaction(async (tx) => {
      const journalEntry = await tx.journalEntry.create({
        data: {
          entryNumber,
          description: data.description,
          sourceModule: data.sourceModule,
          eventTrigger: data.eventTrigger,
          reference: data.reference,
          performedBy: data.performedBy || 'WorkflowEngine'
        }
      });

      for (const line of data.lines) {
        const account = await tx.chartOfAccount.findUnique({
          where: { accountCode: line.accountCode }
        });

        if (!account) {
          throw new AppError(404, 'ACCOUNT_NOT_FOUND', `Account code ${line.accountCode} not found in Chart of Accounts.`);
        }

        await tx.journalLine.create({
          data: {
            journalEntryId: journalEntry.id,
            accountId: account.id,
            type: line.type,
            amount: line.amount,
            currency: line.currency || 'TZS',
            exchangeRate: line.exchangeRate || 1.0,
            description: line.description || data.description
          }
        });

        // Update Account Balance (Assets/Expenses increase on Debit; Liabilities/Equity/Revenue increase on Credit)
        const isAssetOrExpense = account.category.startsWith('ASSET') || account.category === 'EXPENSE';
        const balanceChange = isAssetOrExpense
          ? (line.type === 'DEBIT' ? line.amount : -line.amount)
          : (line.type === 'CREDIT' ? line.amount : -line.amount);

        await tx.chartOfAccount.update({
          where: { id: account.id },
          data: { balance: { increment: balanceChange } }
        });
      }

      await tx.financialAuditLog.create({
        data: {
          action: 'journal_entry_posted',
          documentType: 'journal_entry',
          documentId: journalEntry.id,
          documentNumber: journalEntry.entryNumber,
          amount: totalDebits,
          currency: 'TZS',
          description: `Journal Entry ${entryNumber} posted from ${data.sourceModule}. ${data.description}`,
          performedBy: data.performedBy || 'WorkflowEngine'
        }
      });

      return journalEntry;
    });
  },

  async createBusinessExpense(data: {
    category: string;
    vendor: string;
    description: string;
    amount: number;
    currency?: 'TZS' | 'USD';
    taxAmount?: number;
    projectId?: string;
    department?: string;
    receiptUrl?: string;
  }) {
    await this.seedDefaultChartOfAccounts();

    const currentYear = new Date().getFullYear();
    const count = await prisma.businessExpense.count();
    const expenseNumber = `EXP-${currentYear}-${(count + 1).toString().padStart(6, '0')}`;

    const expense = await prisma.businessExpense.create({
      data: {
        expenseNumber,
        category: data.category,
        vendor: data.vendor,
        description: data.description,
        amount: data.amount,
        currency: data.currency || 'TZS',
        taxAmount: data.taxAmount || 0,
        projectId: data.projectId,
        department: data.department || 'Operations',
        status: 'approved',
        receiptUrl: data.receiptUrl
      }
    });

    // Auto-post Double Entry: Debit Expense Account (5000/5300), Credit Cash (1010)
    let expenseAccountCode = '5300';
    if (data.category.toLowerCase().includes('infra') || data.category.toLowerCase().includes('server')) expenseAccountCode = '5000';
    else if (data.category.toLowerCase().includes('salary') || data.category.toLowerCase().includes('fee')) expenseAccountCode = '5100';
    else if (data.category.toLowerCase().includes('market') || data.category.toLowerCase().includes('comm')) expenseAccountCode = '5200';

    await this.postJournalEntry({
      description: `Expense ${expenseNumber}: ${data.vendor} - ${data.description}`,
      sourceModule: 'Finance',
      eventTrigger: 'ExpenseRecorded',
      reference: expenseNumber,
      lines: [
        { accountCode: expenseAccountCode, type: 'DEBIT', amount: data.amount, currency: data.currency || 'TZS' },
        { accountCode: '1010', type: 'CREDIT', amount: data.amount, currency: data.currency || 'TZS' }
      ]
    });

    return expense;
  },

  async getExpenses(filters?: { category?: string; projectId?: string }) {
    return prisma.businessExpense.findMany({
      where: {
        category: filters?.category ? { contains: filters.category, mode: 'insensitive' } : undefined,
        projectId: filters?.projectId || undefined
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getJournalEntries() {
    return prisma.journalEntry.findMany({
      include: {
        lines: {
          include: { account: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  },

  async getFinancialStatements() {
    await this.seedDefaultChartOfAccounts();

    const accounts = await prisma.chartOfAccount.findMany();

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    for (const acc of accounts) {
      const bal = Number(acc.balance);
      if (acc.category === 'REVENUE') totalRevenue += bal;
      else if (acc.category === 'EXPENSE') totalExpenses += bal;
      else if (acc.category.startsWith('ASSET')) totalAssets += bal;
      else if (acc.category.startsWith('LIABILITY')) totalLiabilities += bal;
      else if (acc.category === 'EQUITY') totalEquity += bal;
    }

    const netProfit = totalRevenue - totalExpenses;

    return {
      profitAndLoss: {
        totalRevenue,
        totalExpenses,
        netProfit,
        marginPercent: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
      },
      balanceSheet: {
        totalAssets,
        totalLiabilities,
        totalEquity: totalEquity + netProfit,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity + netProfit)) < 1.0
      },
      accounts
    };
  },

  async getProjectFinancialSummary(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return null;

    const invoices = await prisma.invoice.findMany({ where: { projectId } });
    const expenses = await prisma.businessExpense.findMany({ where: { projectId } });

    let revenue = 0;
    for (const inv of invoices) {
      if (inv.status === 'paid') revenue += Number(inv.total);
    }

    let actualCost = 0;
    for (const exp of expenses) {
      actualCost += Number(exp.amount);
    }

    const estimatedCost = Number(project.budget || 0);
    const grossProfit = revenue - actualCost;
    const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return {
      projectId: project.id,
      projectTitle: project.title,
      estimatedCost,
      actualCost,
      revenue,
      grossProfit,
      profitMargin
    };
  },

  async getCRMClientFinancialSummary(email: string) {
    const lead = await prisma.lead.findFirst({ where: { email } });
    const org = await prisma.organization.findFirst({ where: { email } });

    const orgId = org?.id;

    const quotations = orgId ? await prisma.quotation.findMany({ where: { organizationId: orgId } }) : [];
    const invoices = orgId ? await prisma.invoice.findMany({ where: { organizationId: orgId } }) : [];

    let totalQuotesValue = 0;
    for (const q of quotations) totalQuotesValue += Number(q.total);

    let totalInvoiced = 0;
    let totalPayments = 0;
    let outstandingBalance = 0;

    for (const inv of invoices) {
      totalInvoiced += Number(inv.total);
      if (inv.status === 'paid') totalPayments += Number(inv.total);
      else if (inv.status === 'sent' || inv.status === 'overdue') outstandingBalance += Number(inv.total);
    }

    const lifetimeValue = totalPayments;
    const avgProjectValue = invoices.length > 0 ? totalPayments / invoices.length : 0;

    return {
      email,
      name: org?.name || lead?.name || 'Contact',
      totalQuotations: quotations.length,
      totalQuotationsValue: totalQuotesValue,
      totalInvoices: invoices.length,
      totalInvoiced,
      totalPayments,
      outstandingBalance,
      lifetimeValue,
      avgProjectValue
    };
  }
};

