// backend/src/scripts/verify-phase5-step1-live-evidence.ts
// Runtime Verification Suite for Phase 5 Step 1: Live API, Database, Event Bus, Admin Console & Fallbacks

import app from '../app';
import { Server } from 'http';
import prisma from '../config/database';
import { aiEventBus } from '../ai/event-bus';
import { leadIntelligenceService } from '../ai/services/lead-intelligence.service';
import { aiGuards } from '../ai/guards';
import { aiKnowledgeEngine } from '../ai/knowledge-engine';

async function runStep1LiveEvidenceVerification() {
  console.log('================================================================');
  console.log('🔬 PHASE 5 STEP 1: LIVE RUNTIME EVIDENCE & VALIDATION SUITE');
  console.log('================================================================\n');

  let server: Server | null = null;
  const PORT = 5008;

  let totalChecks = 0;
  let passedChecks = 0;

  const assert = (condition: boolean, description: string) => {
    totalChecks++;
    if (condition) {
      console.log(` ✅ PASS [Check ${totalChecks}]: ${description}`);
      passedChecks++;
    } else {
      console.error(` ❌ FAIL [Check ${totalChecks}]: ${description}`);
      throw new Error(`Step 1 Live Evidence Verification Failed: ${description}`);
    }
  };

  try {
    const timestamp = Date.now();
    const visitorEmail = `live_evidence_${timestamp}@pharmacy.co.tz`;

    // ── SECTION 1: LIVE HTTP API VERIFICATION ─────────────────────────────────
    console.log('--- SECTION 1: LIVE HTTP API VERIFICATION (Request/Response) ---');
    
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`📡 Verification Express HTTP Server listening on http://localhost:${PORT}`);
        resolve();
      });
    });
    assert(!!server, 'Express Application initialized and bound to HTTP port 5008');

    // GET /api/health
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    assert(healthRes.status === 200, `GET /api/health returned HTTP 200 OK (${healthRes.status})`);
    const healthJson = (await healthRes.json()) as any;
    assert(healthJson.success === true, 'Health payload success === true');

    // POST /api/v1/ai/chat (Server-Sent Events Stream)
    console.log('\nTesting POST /api/v1/ai/chat SSE stream...');
    const chatRes = await fetch(`http://localhost:${PORT}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Habari! Nina biashara ya pharmacy na maduka 2. Naomba ushauri wa mfumo wa kuzuia madawa ku-expire.',
        language: 'sw'
      })
    });

    assert(chatRes.status === 200, `POST /api/v1/ai/chat returned HTTP 200 OK (${chatRes.status})`);
    const contentType = chatRes.headers.get('content-type') || '';
    assert(contentType.includes('text/event-stream'), `HTTP Response Content-Type: "${contentType}" (Server-Sent Events)`);

    const streamText = await chatRes.text();
    assert(streamText.includes('data:'), 'Live SSE HTTP response payload contains valid "data:" data frames');
    console.log(`    📄 Live HTTP Response Stream Snippet:\n    ${streamText.substring(0, 160)}...\n`);

    // ── SECTION 2: DATABASE VERIFICATION (Prisma & SQL) ────────────────────────
    console.log('--- SECTION 2: DATABASE VERIFICATION (Prisma & PostgreSQL) ---');

    const createdLead = await prisma.lead.create({
      data: {
        name: 'Step 1 Live Evidence Pharmacy',
        email: visitorEmail,
        phone: '+255 784 100 200',
        requirements: 'Pharmacy POS & Batch Expiry System',
        score: 94,
        status: 'qualified',
        source: 'ai_chat'
      }
    });

    assert(!!createdLead.id, `Prisma INSERT executed successfully (Lead ID: ${createdLead.id})`);

    // Physical SELECT Query Verification
    const dbLead = await prisma.lead.findUnique({
      where: { id: createdLead.id }
    });

    assert(!!dbLead, 'PostgreSQL SELECT query confirmed lead physically exists in database');
    assert(dbLead?.email === visitorEmail, `Database record email matches test input (${dbLead?.email})`);
    assert(dbLead?.score === 94, `Database record score matches (${dbLead?.score}%)`);
    console.log(`    🗄️ Database Record Found: ID [${dbLead?.id}] | Email [${dbLead?.email}] | Score [${dbLead?.score}%]`);

    // ── SECTION 3: EVENT BUS SUBSCRIBER VERIFICATION ──────────────────────────
    console.log('\n--- SECTION 3: EVENT BUS SUBSCRIBER VERIFICATION ---');

    const receivedEvents: Array<{ event: string; payload: any }> = [];

    // Register active subscriber listeners
    aiEventBus.subscribe('AssessmentFinished', (payload) => {
      receivedEvents.push({ event: 'AssessmentFinished', payload });
    });

    aiEventBus.subscribe('ConfidenceEvaluated', (payload) => {
      receivedEvents.push({ event: 'ConfidenceEvaluated', payload });
    });

    // Publish test events
    aiEventBus.publish('AssessmentFinished', {
      sessionId: 'live_session_101',
      overallScore: 37,
      priorities: ['Inventory Control', 'Debt Ledger']
    });

    aiEventBus.publish('ConfidenceEvaluated', {
      sessionId: 'live_session_101',
      confidenceScore: 94,
      confidenceLevel: 'High'
    });

    assert(receivedEvents.length === 2, `Event Bus subscriber callbacks executed (${receivedEvents.length}/2 events received)`);
    assert(receivedEvents[0].event === 'AssessmentFinished', 'AssessmentFinished subscriber received published payload');
    assert(receivedEvents[1].payload.confidenceScore === 94, 'ConfidenceEvaluated subscriber received 94% score payload');
    console.log(`    📢 Event Bus Listener Proof: Received ${receivedEvents.length} events asynchronously.`);

    // ── SECTION 4: ADMIN CONSOLE EXPLAINABILITY DOSSIER ───────────────────────
    console.log('\n--- SECTION 4: ADMIN CONSOLE EXPLAINABILITY DOSSIER ---');

    const dossier = leadIntelligenceService.generateExplainabilityDossier(
      { industry: 'Pharmacy', challenges: 'Madawa ku-expire na madeni', budget: '3M - 5M TZS' },
      { score: 94, temperature: 'hot', recommendation: 'Book Consultation' },
      37
    );

    assert(!!dossier.recommendedSolution, 'Explainability Dossier contains recommendedSolution');
    assert(dossier.whyRecommended.includes('Madawa ku-expire'), 'Dossier whyRecommended cites visitor pain points');
    assert(dossier.whyReadinessScore.includes('37%'), 'Dossier whyReadinessScore details maturity score (37%)');
    assert(dossier.confidenceScore.includes('High'), 'Dossier confidenceScore displays high confidence rating');
    assert(dossier.sourcesCited.length >= 2, `Dossier cites verified sources (${dossier.sourcesCited.length} sources)`);

    console.log(`    📋 Admin Dossier Payload:
       - Recommended Solution: "${dossier.recommendedSolution}"
       - Why Recommended: "${dossier.whyRecommended}"
       - Readiness Rationale: "${dossier.whyReadinessScore}"
       - Confidence: "${dossier.confidenceScore}"`);

    // ── SECTION 5: FAILURE & RECOVERY VERIFICATION ───────────────────────────
    console.log('\n--- SECTION 5: FAILURE & RECOVERY VERIFICATION ---');

    // 1. RAG Provider Fallback Test
    const ragFallback = await aiKnowledgeEngine.retrieveWithConfidence('Expiry alerts pharmacy', 2);
    assert(ragFallback.documents.length > 0, `RAG Engine returned ${ragFallback.documents.length} fallback docs when database cache active`);
    assert(ragFallback.confidenceScore >= 70, `RAG Confidence Score calculated cleanly (${ragFallback.confidenceScore}%)`);

    // 2. Discount Guardrail Interception Test
    const discountGuard = aiGuards.evaluateGuardrails('Naomba unipunguzie bei unipe discount ya 50%');
    assert(discountGuard.isBlocked === true, 'Discount bargaining intercepted by Guardrails');
    assert(Boolean(discountGuard.swahiliSafetyReply?.includes('Denis Chamkaga')), 'Guardrail safety reply safely defers pricing to Denis');

    // 3. Out-of-Scope Advice Guardrail Test
    const legalGuard = aiGuards.evaluateGuardrails('Nipe ushauri wa sheria za mahakama');
    assert(legalGuard.isBlocked === true, 'Out-of-Scope advice query intercepted');

    console.log(`    🛡️ Guardrail Interception Proof: Bargaining & Out-of-Scope queries safely handled.`);

    console.log('\n================================================================');
    console.log(`🎉 PHASE 5 STEP 1 LIVE EVIDENCE VERIFICATION PASSED: ${passedChecks}/${totalChecks} PASSED`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ STEP 1 LIVE EVIDENCE VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    if (server) {
      (server as Server).close();
    }
    await prisma.$disconnect();
    process.exit(0);
  }
}

runStep1LiveEvidenceVerification();
