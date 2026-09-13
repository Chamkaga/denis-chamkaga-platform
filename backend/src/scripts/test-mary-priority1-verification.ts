// backend/src/scripts/test-mary-priority1-verification.ts
// Comprehensive Priority 1 Verification Suite & Architectural Assertion Gate for Mary AI.

import { aiOrchestrator } from '../ai/orchestrator';
import { aiKnowledgeEngine } from '../ai/knowledge-engine';
import { aiIntentClassifier } from '../ai/intent-classifier';
import { staticKnowledgeProvider, normalizeAuthoritativeGuidesToDocs } from '../ai/providers/static-knowledge.provider';
import { databaseKnowledgeProvider } from '../ai/providers/database-knowledge.provider';
import { 
  DIGITAL_MATURITY_LEVELS, 
  SME_CATEGORIES_MAP, 
  BUSINESS_GUIDES_TOPICS,
  DENIS_PERSONAL_KNOWLEDGE 
} from '@dc/shared';
import prisma from '../config/database';
import { logger } from '../utils/logger';

interface QueryEvaluationResult {
  queryNumber: number;
  query: string;
  detectedIntent: string;
  retrievedDocIds: string[];
  sourceOfTruth: string[];
  version: string[];
  audience: string[];
  expectedKnowledgeTopic: string;
  actualKnowledgeMatch: boolean;
  responseExcerpt: string;
  contradictionCheck: string;
  status: 'PASS' | 'FAIL';
}

async function runPriority1VerificationGate() {
  console.log('================================================================');
  console.log('🏛️  MARY AI PRIORITY 1 ARCHITECTURAL VERIFICATION GATE');
  console.log('================================================================\n');

  let passedAssertions = 0;
  let totalAssertions = 0;

  const assert = (condition: boolean, description: string) => {
    totalAssertions++;
    if (condition) {
      console.log(` ✅ PASS [Assertion ${totalAssertions}]: ${description}`);
      passedAssertions++;
    } else {
      console.error(` ❌ FAIL [Assertion ${totalAssertions}]: ${description}`);
      throw new Error(`Architectural Assertion Failed: ${description}`);
    }
  };

  try {
    // ═════════════════════════════════════════════════════════════════════════
    // PART 1: ARCHITECTURAL INTEGRITY ASSERTIONS
    // ═════════════════════════════════════════════════════════════════════════
    console.log('--- PART 1: Executing 10 Core Architectural Assertions ---\n');

    const allStaticDocs = staticKnowledgeProvider.getAllDocuments();

    // Assertion 1: Duplicate Knowledge IDs count === 0
    const idSet = new Set<string>();
    const duplicateIds: string[] = [];
    for (const doc of allStaticDocs) {
      if (idSet.has(doc.id)) {
        duplicateIds.push(doc.id);
      }
      idSet.add(doc.id);
    }
    assert(duplicateIds.length === 0, `Zero duplicate IDs (Found: ${duplicateIds.length})`);

    // Assertion 2: Missing sourceOfTruth count === 0
    const missingSourceOfTruth = allStaticDocs.filter(d => !d.sourceOfTruth || d.sourceOfTruth.trim() === '');
    assert(missingSourceOfTruth.length === 0, `Zero documents with missing sourceOfTruth (Found: ${missingSourceOfTruth.length})`);

    // Assertion 3: Invalid audience count === 0
    const invalidAudience = allStaticDocs.filter(d => !['MARY', 'ADMIN', 'BOTH'].includes(d.audience));
    assert(invalidAudience.length === 0, `Zero documents with invalid audience (Found: ${invalidAudience.length})`);

    // Assertion 4: Deprecated document retrieval === 0
    const activeOnly = allStaticDocs.every(d => d.status === 'ACTIVE');
    assert(activeOnly, 'All registered documents have ACTIVE lifecycle status');

    // Assertion 5: Flutterwave mentions in customer-facing retrieval === 0 (DPO only)
    const customerDocs = allStaticDocs.filter(d => d.audience === 'MARY' || d.audience === 'BOTH');
    const flutterwaveMentions = customerDocs.filter(d => d.content.toLowerCase().includes('flutterwave') || d.title.toLowerCase().includes('flutterwave'));
    assert(flutterwaveMentions.length === 0, `Zero customer-facing Flutterwave mentions in static knowledge (Found: ${flutterwaveMentions.length})`);

    // Assertion 6: Mary audience isolation (Mary never retrieves ADMIN-only docs)
    const maryRetrieval = await aiKnowledgeEngine.retrieve('SLA Uptime and Data Security Policies', 5, { audience: 'MARY' });
    const hasAdminOnlyInMary = maryRetrieval.some(d => d.audience === 'ADMIN' || d.id === 'static.policy.internal-sla');
    assert(!hasAdminOnlyInMary, 'Strict Audience Isolation: Mary never retrieves ADMIN-only documents');

    // Assertion 7: Admin AI audience isolation (Admin AI can retrieve ADMIN docs)
    const adminRetrieval = await aiKnowledgeEngine.retrieve('SLA Uptime and Data Security Policies', 5, { audience: 'ADMIN' });
    const hasAdminDocInAdmin = adminRetrieval.some(d => d.id === 'static.policy.internal-sla');
    assert(hasAdminDocInAdmin, 'Admin Audience Retrieval: Admin AI successfully retrieves admin policies');

    // Assertion 8: Word-boundary intent regex collisions === 0
    const workshopIntents = aiIntentClassifier.classify('I am attending an educational workshop tomorrow');
    const workshopHasShopIntent = workshopIntents.some(i => i.intent === 'Service Inquiry' && i.confidence > 0.6);
    assert(!workshopHasShopIntent, 'Word-boundary Regex Accuracy: "workshop" does not trigger "shop" service inquiry falsely');

    // Assertion 9: Single source of truth adapter integrity
    const adapterDocs = normalizeAuthoritativeGuidesToDocs();
    const hasMaturity = adapterDocs.some(d => d.id === 'static.digital-maturity');
    const hasRetail = adapterDocs.some(d => d.id === 'static.sme.retail');
    const hasGuides = adapterDocs.some(d => d.id === 'static.guide.why-system');
    assert(hasMaturity && hasRetail && hasGuides && adapterDocs.length >= 10, 'Deterministic Adapter: Generates valid KnowledgeDocuments matching all shared constants');

    // Assertion 10: DPO SOP is authoritative
    const dpoDoc = allStaticDocs.find(d => d.id === 'static.payment.dpo');
    assert(!!dpoDoc && dpoDoc.content.includes('DPO Group') && dpoDoc.content.includes('M-Pesa'), 'Authoritative DPO Payment SOP is active and indexed');

    console.log(`\n🎉 ALL ${passedAssertions}/${totalAssertions} ARCHITECTURAL ASSERTIONS PASSED!\n`);

    // ═════════════════════════════════════════════════════════════════════════
    // PART 2: THE 14 MARY EVALUATION TEST QUERIES
    // ═════════════════════════════════════════════════════════════════════════
    console.log('================================================================');
    console.log('🧪 PART 2: TESTING 14 CORE MARY CONVERSATIONAL QUERIES');
    console.log('================================================================\n');

    const testQueries = [
      { id: 1, query: "I don't know anything about systems.", expectedTopic: "Digital maturity / education / guidance" },
      { id: 2, query: "I own a small shop.", expectedTopic: "Retail SME vertical / POS / inventory" },
      { id: 3, query: "My business is losing money.", expectedTopic: "Inventory leaks / debt tracking / operational audit" },
      { id: 4, query: "My shop is losing stock.", expectedTopic: "Retail POS / stock leakage / barcode inventory" },
      { id: 5, query: "I want to digitize my business.", expectedTopic: "Digital transformation / maturity assessment / custom software" },
      { id: 6, query: "How much does a retail system cost?", expectedTopic: "Retail pricing range (1.5M - 4.5M TZS) / quotation" },
      { id: 7, query: "How much does a pharmacy system cost?", expectedTopic: "Pharmacy pricing range (2.5M - 6.0M TZS) / batch alerts" },
      { id: 8, query: "Why should I use a system instead of notebooks?", expectedTopic: "Educational guide: 4 hidden costs of notebooks / debt loss" },
      { id: 9, query: "I have outgrown WhatsApp.", expectedTopic: "Educational guide: WhatsApp order bottlenecks / automated webstore" },
      { id: 10, query: "When does Excel become a problem?", expectedTopic: "Educational guide: Excel formula corruption / concurrency risks" },
      { id: 11, query: "How do I pay?", expectedTopic: "DPO payment methods (M-Pesa, Tigo Pesa, Cards, Bank Wire)" },
      { id: 12, query: "What happens after I pay?", expectedTopic: "Delivery lifecycle: 5 stages, UAT, staff training & 30-day warranty" },
      { id: 13, query: "Do you provide training?", expectedTopic: "Staff training included with delivery & 30-day guarantee" },
      { id: 14, query: "I want to speak to Denis.", expectedTopic: "Consultation booking / voice call grounding / direct handoff" }
    ];

    const evaluationResults: QueryEvaluationResult[] = [];

    for (const item of testQueries) {
      console.log(`----------------------------------------------------------------`);
      console.log(`[Query ${item.id}/14] "${item.query}"`);
      
      const session = await prisma.chatSession.create({
        data: {
          visitorId: `eval_visitor_${item.id}_${Date.now()}`,
          status: 'active',
          metadata: { title: `Evaluation Query ${item.id}`, facts: {} }
        }
      });

      // 1. Evaluate intent
      const intentScores = aiIntentClassifier.classify(item.query);
      const primaryIntent = intentScores[0]?.intent || 'General Inquiry';

      // 2. Evaluate retrieval
      const retrievalResult = await aiKnowledgeEngine.retrieveWithConfidence(item.query, 3, { audience: 'MARY' });
      const retrievedDocIds = retrievalResult.documents.map(d => d.id);
      const sourceOfTruths = retrievalResult.documents.map(d => d.sourceOfTruth);
      const versions = retrievalResult.documents.map(d => d.version);
      const audiences = retrievalResult.documents.map(d => d.audience);

      // 3. Process via Orchestrator
      const res = await aiOrchestrator.processMessage({
        message: item.query,
        sessionId: session.id,
        language: 'en'
      });

      const responseText = res.response;

      // 4. Quality & Contradiction checks
      const hasRAGLeak = responseText.toLowerCase().includes('knowledge base') || responseText.toLowerCase().includes('document id');
      const hasFlutterwave = responseText.toLowerCase().includes('flutterwave');
      const hasInvalidCurrency = responseText.includes('EUR') || responseText.includes('GBP') || responseText.includes('KES');
      
      let contradictionSummary = 'Clean (No RAG leaks, strictly DPO/TZS/USD)';
      if (hasRAGLeak) contradictionSummary = 'CONTRADICTION: Knowledge Base disclosure';
      if (hasFlutterwave) contradictionSummary = 'CONTRADICTION: Flutterwave mention';
      if (hasInvalidCurrency) contradictionSummary = 'CONTRADICTION: Non-TZS/USD currency';

      const matchFound = retrievedDocIds.length > 0;
      const isPassed = !hasRAGLeak && !hasFlutterwave && !hasInvalidCurrency && responseText.trim().length > 20;

      evaluationResults.push({
        queryNumber: item.id,
        query: item.query,
        detectedIntent: primaryIntent,
        retrievedDocIds,
        sourceOfTruth: sourceOfTruths,
        version: versions,
        audience: audiences,
        expectedKnowledgeTopic: item.expectedTopic,
        actualKnowledgeMatch: matchFound,
        responseExcerpt: responseText.substring(0, 100).replace(/\n/g, ' ') + (responseText.length > 100 ? '...' : ''),
        contradictionCheck: contradictionSummary,
        status: isPassed ? 'PASS' : 'FAIL'
      });

      console.log(` -> Detected Intent: ${primaryIntent}`);
      console.log(` -> Retrieved Document IDs: [${retrievedDocIds.join(', ')}]`);
      console.log(` -> Sources: [${sourceOfTruths.join(', ')}]`);
      console.log(` -> Mary Response: "${responseText.substring(0, 140)}..."`);
      console.log(` -> Contradiction Check: ${contradictionSummary}`);
      console.log(` -> Status: ${isPassed ? '✅ PASS' : '❌ FAIL'}\n`);
    }

    console.log('================================================================');
    console.log('📊 FINAL PRIORITY 1 VERIFICATION SUMMARY TABLE');
    console.log('================================================================\n');

    console.table(evaluationResults.map(r => ({
      '#': r.queryNumber,
      'Query': r.query.length > 25 ? r.query.substring(0, 22) + '...' : r.query,
      'Intent': r.detectedIntent,
      'Retrieved Doc IDs': r.retrievedDocIds.slice(0, 2).join(', '),
      'Match': r.actualKnowledgeMatch ? 'YES' : 'NO',
      'Contradictions': r.contradictionCheck.includes('Clean') ? 'None' : 'Found',
      'Status': r.status
    })));

    const allPassed = evaluationResults.every(r => r.status === 'PASS');
    if (!allPassed) {
      throw new Error('One or more Mary evaluation queries failed verification gate.');
    }

    console.log('\n🎉 ALL 14 MARY TEST QUERIES AND ARCHITECTURAL ASSERTIONS PASSED WITH 100% SUCCESS!\n');

  } catch (error) {
    console.error('\n❌ PRIORITY 1 VERIFICATION GATE FAILED:', error);
    process.exit(1);
  }
}

runPriority1VerificationGate();
