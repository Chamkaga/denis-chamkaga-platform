// src/routes/finance.routes.ts
// Express API routing for ERP Finance Operations: Quotations, Invoices, payments, receipts, and Credit Notes.

import { Router, Request, Response, NextFunction } from 'express';
import { financeService } from '../services/finance.service';
import { requireAuth, requireRole, requireResourceAccess, requirePermission } from '../middleware/auth.middleware';
import { ApiResponse } from '../types/api';
import prisma from '../config/database';

const router = Router();

// Secure admin routes
router.use(requireAuth);
router.use(requireResourceAccess('finance'));

const wrap = (fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ─── 1. Tenant Configuration ────────────────────────────────────────────────
router.get('/tenant-config', wrap(async (_req, res) => {
  const config = await prisma.tenantConfig.findFirst();
  res.json({ success: true, data: config } satisfies ApiResponse);
}));

router.put('/tenant-config', wrap(async (req, res) => {
  const active = await prisma.tenantConfig.findFirst();
  const id = active?.id || 'default-tenant';
  const item = await prisma.tenantConfig.upsert({
    where: { id },
    update: req.body,
    create: { id, ...req.body }
  });
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ─── 2. Quotations ───────────────────────────────────────────────────────────
router.get('/quotations', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await financeService.getQuotations({ search: q.search, organizationId: q.organizationId, status: q.status });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/quotations', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const item = await financeService.createQuotation(req.body, username);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

// Version Revision Cloner
router.post('/quotations/:id/revise', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const item = await financeService.cloneQuotationVersion(req.params.id, req.body, username);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

// Manual Quotation Approval
router.post('/quotations/:id/approve', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const result = await financeService.approveQuotation(req.params.id, req.body.approvalNotes, username);
  res.json({ success: true, data: result } satisfies ApiResponse);
}));

router.get('/quotations/:id/pdf', wrap(async (req, res) => {
  const pdfBuffer = await financeService.getQuotationPdf(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=quotation-${req.params.id}.pdf`);
  res.send(pdfBuffer);
}));

// ─── 3. Invoices ─────────────────────────────────────────────────────────────
router.get('/invoices', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await financeService.getInvoices({ search: q.search, organizationId: q.organizationId, status: q.status });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.get('/invoices/:id', wrap(async (req, res) => {
  const detail = await financeService.getInvoiceDetails(req.params.id);
  res.json({ success: true, data: detail } satisfies ApiResponse);
}));

router.post('/invoices', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const item = await financeService.createInvoice(req.body, username);
  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}));

router.patch('/invoices/:id/status', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const item = await financeService.updateInvoiceStatus(req.params.id, req.body.status, username);
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.get('/invoices/:id/pdf', wrap(async (req, res) => {
  const pdfBuffer = await financeService.getInvoicePdf(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${req.params.id}.pdf`);
  res.send(pdfBuffer);
}));

router.post('/invoices/:id/email', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const success = await financeService.sendInvoiceEmail(req.params.id, username);
  res.json({ success, data: { message: success ? 'Invoice sent to customer' : 'Failed to send' } } satisfies ApiResponse);
}));

// ─── 4. Credit Notes ─────────────────────────────────────────────────────────
router.get('/credit-notes', wrap(async (_req, res) => {
  const list = await prisma.creditNote.findMany({
    include: { invoice: { include: { organization: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/invoices/:id/credit-notes', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const { amount, reason } = req.body;
  const cn = await financeService.createCreditNote(req.params.id, +amount, reason, username);
  res.status(201).json({ success: true, data: cn } satisfies ApiResponse);
}));

// ─── 5. Payments & Receipts Ledger ──────────────────────────────────────────
router.get('/payments', wrap(async (_req, res) => {
  const list = await prisma.payment.findMany({
    include: { invoice: { include: { organization: true } } },
    orderBy: { paymentDate: 'desc' }
  });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/invoices/:id/payments', requirePermission('finance', 'verify'), wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const pay = await financeService.recordPayment(req.params.id, req.body, username);
  res.status(201).json({ success: true, data: pay } satisfies ApiResponse);
}));

router.get('/receipts/:number/pdf', wrap(async (req, res) => {
  const pdfBuffer = await financeService.getReceiptPdfByNumber(req.params.number);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt-${req.params.number}.pdf`);
  res.send(pdfBuffer);
}));

// Email quotation
router.post('/quotations/:id/email', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const success = await financeService.sendQuotationEmail(req.params.id, username);
  res.json({ success, data: { message: success ? 'Quotation emailed to customer' : 'Failed to send' } } satisfies ApiResponse);
}));

// Access tokens management
router.post('/access/generate', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const { docId, docType, expiresDays } = req.body;
  const rawToken = await financeService.generateAccessToken(docId, docType, expiresDays || 30, username);
  res.status(201).json({ success: true, data: { token: rawToken } } satisfies ApiResponse);
}));

router.post('/access/revoke', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  await financeService.revokeAccessToken(req.body.token, username);
  res.json({ success: true, data: { message: 'Token revoked successfully' } } satisfies ApiResponse);
}));

router.get('/access/:docId/analytics', wrap(async (req, res) => {
  const accessRecords = await prisma.documentAccess.findMany({
    where: { documentId: req.params.docId },
    include: { logs: { orderBy: { viewedAt: 'desc' } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: accessRecords } satisfies ApiResponse);
}));

// ─── 6. Enterprise ERP Double-Entry Accounting & Reports ──────────────────
router.get('/accounts', wrap(async (_req, res) => {
  const accounts = await financeService.getChartOfAccounts();
  res.json({ success: true, data: accounts } satisfies ApiResponse);
}));

router.get('/journals', wrap(async (_req, res) => {
  const entries = await financeService.getJournalEntries();
  res.json({ success: true, data: entries } satisfies ApiResponse);
}));

router.post('/journals', wrap(async (req, res) => {
  const username = (req as any).user?.email || 'admin';
  const entry = await financeService.postJournalEntry({ ...req.body, performedBy: username });
  res.status(201).json({ success: true, data: entry } satisfies ApiResponse);
}));

router.get('/expenses', wrap(async (req, res) => {
  const q = req.query as Record<string, string>;
  const list = await financeService.getExpenses({ category: q.category, projectId: q.projectId });
  res.json({ success: true, data: list } satisfies ApiResponse);
}));

router.post('/expenses', wrap(async (req, res) => {
  const exp = await financeService.createBusinessExpense(req.body);
  res.status(201).json({ success: true, data: exp } satisfies ApiResponse);
}));

router.get('/reports/pnl', wrap(async (_req, res) => {
  const statements = await financeService.getFinancialStatements();
  res.json({ success: true, data: statements.profitAndLoss } satisfies ApiResponse);
}));

router.get('/reports/balance-sheet', wrap(async (_req, res) => {
  const statements = await financeService.getFinancialStatements();
  res.json({ success: true, data: statements.balanceSheet } satisfies ApiResponse);
}));

router.get('/project-summary/:projectId', wrap(async (req, res) => {
  const summary = await financeService.getProjectFinancialSummary(req.params.projectId);
  res.json({ success: true, data: summary } satisfies ApiResponse);
}));

router.get('/client-summary', wrap(async (req, res) => {
  const email = (req.query.email as string) || '';
  const summary = await financeService.getCRMClientFinancialSummary(email);
  res.json({ success: true, data: summary } satisfies ApiResponse);
}));

export default router;
