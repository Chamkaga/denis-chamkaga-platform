import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { sessionCapabilityService } from '../ai/session-capability.service';
import { sanitizeBlogHtml } from '../utils/html-sanitizer';
import { AppError } from '../middleware/errorHandler';
import { memoryJobService } from '../ai/memory-job.service';
import app from '../app';

async function expectCode(fn: () => unknown | Promise<unknown>, code: string) {
  await assert.rejects(async () => { await fn(); }, (error: unknown) => error instanceof AppError && error.code === code);
}

async function main() {
  const visitorA = `security-a-${Date.now()}`;
  const visitorB = `security-b-${Date.now()}`;
  const [sessionA, sessionB] = await Promise.all([
    prisma.chatSession.create({ data: { visitorId: visitorA } }),
    prisma.chatSession.create({ data: { visitorId: visitorB } })
  ]);
  try {
    const capabilityA = sessionCapabilityService.issue(sessionA.id, visitorA);
    assert.equal(sessionCapabilityService.verify(capabilityA).sessionId, sessionA.id);
    await expectCode(() => sessionCapabilityService.assertRequestAccess({ header: () => capabilityA } as any, { sessionId: sessionB.id }), 'SESSION_ACCESS_DENIED');
    await expectCode(() => sessionCapabilityService.assertRequestAccess({ header: () => `${capabilityA}x` } as any, { sessionId: sessionA.id }), 'INVALID_SESSION_CAPABILITY');
    await expectCode(() => sessionCapabilityService.assertRequestAccess({ header: () => undefined } as any, { sessionId: sessionA.id }), 'SESSION_CAPABILITY_REQUIRED');

    const expired = jwt.sign(
      { kind: 'mary-session', sessionId: sessionA.id, visitorId: visitorA },
      env.SESSION_CAPABILITY_SECRET || env.JWT_SECRET,
      { expiresIn: -1, issuer: 'denis-chamkaga-platform', audience: 'mary-conversation', subject: sessionA.id }
    );
    await expectCode(() => sessionCapabilityService.assertRequestAccess({ header: () => expired } as any, { sessionId: sessionA.id }), 'SESSION_CAPABILITY_EXPIRED');

    const server = app.listen(0);
    try {
      const address = server.address();
      assert(address && typeof address === 'object');
      const base = `http://127.0.0.1:${address.port}/api/ai`;
      const request = (path: string, init: RequestInit = {}) => fetch(`${base}${path}`, init);
      assert.equal((await request(`/sessions/${sessionA.id}/history`)).status, 401);
      assert.equal((await request(`/sessions/${sessionB.id}/history`, { headers: { 'X-Session-Capability': capabilityA } })).status, 403);
      assert.equal((await request(`/sessions/${sessionB.id}/rename`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-Session-Capability': capabilityA }, body: JSON.stringify({ title: 'stolen' }) })).status, 403);
      assert.equal((await request(`/sessions/${sessionB.id}`, { method: 'DELETE', headers: { 'X-Session-Capability': capabilityA } })).status, 403);
      assert.equal((await request(`/sessions/${sessionA.id}/history`, { headers: { 'X-Session-Capability': capabilityA } })).status, 200);
      assert.equal((await request('/webrtc/offer', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Session-Capability': capabilityA }, body: JSON.stringify({ sessionId: sessionA.id, sdpOffer: 'unauthorized-before-mary' }) })).status, 403);
      assert.equal((await request('/webrtc/log', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Session-Capability': capabilityA }, body: JSON.stringify({ sessionId: sessionA.id, status: 'cancelled', denisNotes: 'internal' }) })).status, 403);

      const admin = await prisma.user.findFirst({ where: { isActive: true, role: { name: { in: ['admin', 'super_admin'] } } }, include: { role: true } });
      assert(admin);
      const adminToken = jwt.sign({ userId: admin.id, email: admin.email, roleId: admin.roleId, roleName: admin.role.name }, env.JWT_SECRET, { expiresIn: '5m' });
      assert.equal((await request(`/sessions/${sessionB.id}/history`, { headers: { Authorization: `Bearer ${adminToken}` } })).status, 200);
    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }

    const malicious = '<script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(2)"><svg onload="alert(3)"></svg><a href="javascript:alert(4)">bad</a><p><strong>safe</strong></p>';
    const clean = sanitizeBlogHtml(malicious);
    assert(!/script|onerror|onload|javascript:|<svg/i.test(clean));
    assert(clean.includes('<p><strong>safe</strong></p>'));

    await prisma.aiMemoryJob.create({ data: { sessionId: sessionB.id, conversationVersion: 0, userMessage: 'I own a shop', assistantResponse: 'A pharmacy may need a POS', idempotencyKey: `${sessionB.id}:deletion-test` } });
    await prisma.chatSession.delete({ where: { id: sessionB.id } });
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await memoryJobService.processNext();
      const current = await prisma.aiMemoryJob.findUniqueOrThrow({ where: { idempotencyKey: `${sessionB.id}:deletion-test` } });
      if (current.status !== 'pending') break;
    }
    const cancelled = await prisma.aiMemoryJob.findUniqueOrThrow({ where: { idempotencyKey: `${sessionB.id}:deletion-test` } });
    assert.equal(cancelled.status, 'cancelled');
    console.log('Security regressions PASS: route-level ownership/admin authorization, scoped capability, Mary call authorization gate, WebRTC note denial, expiry/tamper/missing denial, stored-XSS sanitization, deleted-session memory cancellation.');
  } finally {
    await prisma.aiMemoryJob.deleteMany({ where: { sessionId: { in: [sessionA.id, sessionB.id] } } });
    await prisma.chatSession.deleteMany({ where: { id: { in: [sessionA.id, sessionB.id] } } });
    await prisma.$disconnect();
  }
}

main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
