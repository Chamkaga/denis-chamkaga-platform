// src/routes/public.routes.ts
// All public read-only API routes — no authentication required.

import { Router, Request, Response, NextFunction } from 'express';
import { publicService } from '../services/public.service';
import { ApiResponse } from '../types/api';
import { randomUUID } from 'crypto';
import { SupportTier } from '@prisma/client';

const router = Router();

const wrap = (fn: (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } } satisfies ApiResponse);
});

// ── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', wrap(async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query as Record<string, string>;
  const result = await publicService.getProjects({ page: +page || 1, limit: +limit || 12, search, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.get('/projects/featured', wrap(async (_req, res) => {
  const items = await publicService.getFeaturedProjects();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

router.get('/projects/:slug', wrap(async (req, res) => {
  const item = await publicService.getProjectBySlug(req.params.slug);
  if (!item) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }); return; }
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ── Services ─────────────────────────────────────────────────────────────────
router.get('/services', wrap(async (_req, res) => {
  const items = await publicService.getServices();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

router.get('/services/:slug', wrap(async (req, res) => {
  const item = await publicService.getServiceBySlug(req.params.slug);
  if (!item) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } }); return; }
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

// ── Blog ─────────────────────────────────────────────────────────────────────
router.get('/blog-posts', wrap(async (req, res) => {
  const { page, limit, search, category } = req.query as Record<string, string>;
  const result = await publicService.getBlogPosts({ page: +page || 1, limit: +limit || 9, search, categorySlug: category });
  res.json({ success: true, data: result.items, meta: result.meta } satisfies ApiResponse);
}));

router.get('/blog-posts/:slug', wrap(async (req, res) => {
  const item = await publicService.getBlogPostBySlug(req.params.slug);
  if (!item) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } }); return; }
  res.json({ success: true, data: item } satisfies ApiResponse);
}));

router.get('/categories', wrap(async (_req, res) => {
  const items = await publicService.getCategories();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── Testimonials ─────────────────────────────────────────────────────────────
router.get('/testimonials', wrap(async (req, res) => {
  const featured = req.query.featured === 'true';
  const items = await publicService.getTestimonials(featured);
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── Experience & Education ────────────────────────────────────────────────────
router.get('/experiences', wrap(async (_req, res) => {
  const items = await publicService.getExperiences();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

router.get('/education', wrap(async (_req, res) => {
  const items = await publicService.getEducation();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

router.get('/certificates', wrap(async (_req, res) => {
  const items = await publicService.getCertificates();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── Gallery ───────────────────────────────────────────────────────────────────
router.get('/gallery', wrap(async (req, res) => {
  const { category } = req.query as Record<string, string>;
  const items = await publicService.getGallery(category);
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── FAQs ──────────────────────────────────────────────────────────────────────
router.get('/faqs', wrap(async (_req, res) => {
  const items = await publicService.getFaqs();
  res.json({ success: true, data: items } satisfies ApiResponse);
}));

// ── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings', wrap(async (_req, res) => {
  const data = await publicService.getPublicSettings();
  res.json({ success: true, data } satisfies ApiResponse);
}));

// ── Presence ─────────────────────────────────────────────────────────────────
router.get('/presence', wrap(async (_req, res) => {
  const db = (await import('../config/database')).default;
  const { aiCommunicationEngine } = await import('../ai/communication-engine');
  
  const settingsList = await db.siteSetting.findMany({
    where: {
      key: {
        in: ['presence_state', 'contact_phone', 'social_whatsapp', 'contact_email', 'booking_url']
      }
    }
  });
  const settingsMap = Object.fromEntries(settingsList.map(s => [s.key, s.value]));
  const status = settingsMap['presence_state'] || 'Offline';
  
  const contactSettings = {
    phone: settingsMap['contact_phone'],
    whatsapp: settingsMap['social_whatsapp'],
    email: settingsMap['contact_email'],
    bookingUrl: settingsMap['booking_url']
  };

  const rec = aiCommunicationEngine.determineBestChannel(
    { name: '', email: '', phone: '', company: '', budget: undefined },
    'general',
    0,
    status,
    contactSettings
  );

  res.json({ 
    success: true, 
    data: { 
      status,
      recommendation: rec.label,
      reason: rec.reason,
      actionUrl: rec.actionUrl
    } 
  } satisfies ApiResponse);
}));

// ── Contact Form ──────────────────────────────────────────────────────────────
router.post('/contact', wrap(async (req, res) => {
  const { name, email, phone, subject, content } = req.body;
  if (!name || !email || !content) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'name, email and content are required' } });
    return;
  }
  const message = await (await import('../config/database')).default.message.create({
    data: { name, email, phone, subject, content },
  });
  res.status(201).json({ success: true, data: { id: message.id, message: 'Message received. Denis will get back to you soon!' } } satisfies ApiResponse);
}));

// ── DPO Callback & Redirect Handlers ─────────────────────────────────────────
router.post('/payments/dpo/callback', wrap(async (req, res) => {
  const token = (req.query.TransactionToken || req.body.TransactionToken || req.query.TransToken || req.body.TransToken) as string;
  if (!token) {
    res.status(400).send('<?xml version="1.0" encoding="utf-8"?><API3G><Response>MISSING_TOKEN</Response></API3G>');
    return;
  }

  const { financeService: fin } = await import('../services/finance.service');
  try {
    await fin.processVerifiedPayment(token, 'dpo');
    res.set('Content-Type', 'text/xml');
    res.send('<?xml version="1.0" encoding="utf-8"?><API3G><Response>OK</Response></API3G>');
  } catch (err: any) {
    console.error('[DPO IPN Callback] Processing failed:', err);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="utf-8"?><API3G><Response>ERROR</Response><Explanation>${err.message}</Explanation></API3G>`);
  }
}));

router.get('/payments/dpo/verify', wrap(async (req, res) => {
  const token = (req.query.TransactionToken || req.query.TransToken) as string;
  const flow = String(req.query.flow || 'invoice');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (!token) {
    res.redirect(`${frontendUrl}/${flow === 'support' ? 'support/callback' : 'public/invoice/payment-redirect'}?error=missing_token`);
    return;
  }

  const { financeService: fin } = await import('../services/finance.service');
  try {
    const payment = await fin.processVerifiedPayment(token, 'dpo');
    if (payment.gatewayReference?.startsWith('TXN_SUP_')) {
      res.redirect(`${frontendUrl}/support/callback?success=true&token=${token}`);
    } else {
      res.redirect(`${frontendUrl}/public/invoice/payment-redirect?success=true&token=${token}`);
    }
  } catch (err: any) {
    if (flow === 'support' || token.startsWith('TXN_SUP_') || err.message?.includes('TXN_SUP_')) {
      res.redirect(`${frontendUrl}/support/callback?error=${encodeURIComponent(err.message || 'Verification failed')}`);
    } else {
      res.redirect(`${frontendUrl}/billing?error=${encodeURIComponent(err.message || 'Verification failed')}`);
    }
  }
}));

router.get('/payments/verify', wrap(async (req, res) => {
  const token = (req.query.token || req.query.transaction_id) as string;
  if (!token) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'token is required' } });
    return;
  }

  const { financeService: fin } = await import('../services/finance.service');
  try {
    const payment = await fin.processVerifiedPayment(token, 'dpo');
    res.json({
      success: true,
      data: {
        paymentNumber: payment.paymentNumber,
        status: payment.status,
        reference: payment.gatewayReference
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'VERIFICATION_FAILED', message: err.message || 'Payment verification failed' } });
  }
}));

router.post('/payments/support', wrap(async (req, res) => {
  const { amount, currency, email, name, tier } = req.body;
  const allowedTiers = new Set(['seed', 'growth', 'vision', 'champion', 'custom']);
  const normalizedCurrency = String(currency || 'TZS').toUpperCase();
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000000000 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)) || !allowedTiers.has(String(tier || ''))) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A valid amount, currency, email and support tier are required.' } });
    return;
  }
  if (!['TZS', 'USD'].includes(normalizedCurrency)) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Only TZS and USD support currencies are accepted.' } });
    return;
  }

  const { dpoGateway } = await import('../services/dpo.gateway');
  const tierCode = ({ seed: 'SEED', growth: 'GROWTH', vision: 'VISION_BUILDER', champion: 'MISSION_CHAMPION', custom: 'CUSTOM' } as Record<string, string>)[String(tier || '')];
  const txRef = `TXN_SUP_${randomUUID()}`;
  const db = (await import('../config/database')).default;
  await db.supportContribution.create({ data: {
    ctrId: `CTR-${randomUUID()}`, reference: txRef, tier: tierCode as SupportTier,
    status: 'Pending', amount: parsedAmount, currency: normalizedCurrency,
    supporterEmail: String(email).trim().toLowerCase(),
    supporterName: typeof name === 'string' ? name.trim().slice(0, 160) : null,
    paymentProvider: 'DPO',
  } });
  const response = await dpoGateway.initializePayment({
    amount: parsedAmount,
    currency: normalizedCurrency,
    txRef,
    customer: { email, name: name || 'Supporter' },
    customizations: {
      title: 'Support My Work - Denis Chamkaga',
      description: `Optional support contribution (${tierCode}) for Denis Chamkaga work.`
    },
    redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/support/callback`
  });

  if (!response.success || !response.checkoutUrl) {
    await db.supportContribution.update({ where: { reference: txRef }, data: { status: 'Failed' } });
    res.status(502).json({ success: false, error: { code: 'GATEWAY_ERROR', message: response.message || 'Gateway checkout session initialization failed.' } });
    return;
  }

  await db.supportContribution.updateMany({ where: { reference: txRef, status: 'Pending' }, data: { status: 'Redirected' } });
  res.json({
    success: true,
    data: {
      checkoutUrl: response.checkoutUrl,
      reference: txRef
    }
  });
}));

router.get('/tutorials', wrap(async (_req, res) => {
  const items = await (await import('../config/database')).default.tutorial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: items });
}));

export default router;
