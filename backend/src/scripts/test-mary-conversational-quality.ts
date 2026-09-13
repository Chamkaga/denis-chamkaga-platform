// backend/src/scripts/test-mary-conversational-quality.ts
// Comprehensive Conversational Quality & Multi-Turn Intelligence Regression Suite

import { aiOrchestrator } from '../ai/orchestrator';
import { aiMemory } from '../ai/memory';
import prisma from '../config/database';
import { logger } from '../utils/logger';

process.env.AI_FORCE_OFFLINE = 'true';
process.env.AI_MEMORY_ENGINE = 'false';

interface QualityAssertion {
  name: string;
  query: string;
  expectedKeywords: string[];
  forbiddenKeywords: string[];
}

interface ScenarioTest {
  scenarioId: string;
  scenarioTitle: string;
  turns: QualityAssertion[];
}

const SCENARIOS: ScenarioTest[] = [
  // ─── Scenario A: Business Diagnosis (Understand -> Diagnose -> Clarify -> Recommend -> Quote)
  {
    scenarioId: 'SCENARIO_A_BUSINESS_DIAGNOSIS',
    scenarioTitle: 'Scenario A: Retail Shop Owner — Progressive Business Diagnosis Flow',
    turns: [
      {
        name: 'Turn 1: Shop context establishment',
        query: 'I own a small shop.',
        expectedKeywords: ['shop', 'business'],
        forbiddenKeywords: ['whatsapp', 'rocket', '500,000,000']
      },
      {
        name: 'Turn 2: General money loss without channel mention (ZERO unsupported assumptions)',
        query: 'My business is losing money.',
        expectedKeywords: ['sales', 'stock', 'debt', 'overhead'], // Must diagnose 4 areas
        forbiddenKeywords: ['whatsapp orders', 'relying strictly on whatsapp'] // Forbidden: User never said WhatsApp!
      },
      {
        name: 'Turn 3: Specific root cause clarification',
        query: 'Actually the main problem is stock.',
        expectedKeywords: ['stock', 'barcode', 'theft'],
        forbiddenKeywords: ['whatsapp']
      },
      {
        name: 'Turn 4: Solution inquiry',
        query: 'How can you help?',
        expectedKeywords: ['pos', 'inventory'],
        forbiddenKeywords: ['rocket']
      },
      {
        name: 'Turn 5: Quote request retaining shop context',
        query: 'How much?',
        expectedKeywords: ['1,500,000', '4,500,000', 'tzs'],
        forbiddenKeywords: ['in tzs or usd', 'level 0']
      }
    ]
  },

  // ─── Scenario B: Beginner Advisor (Plain language, empathetic education)
  {
    scenarioId: 'SCENARIO_B_BEGINNER_ADVISOR',
    scenarioTitle: 'Scenario B: Beginner Advisor Flow',
    turns: [
      {
        name: 'Turn 1: Total beginner admission',
        query: "I don't know anything about systems.",
        expectedKeywords: ['assistant', 'receipt', 'stock', 'sell'],
        forbiddenKeywords: ['monolithic microservices', 'kubernetes', 'postgres relational normalization']
      },
      {
        name: 'Turn 2: POS explanation in plain language',
        query: 'What is a POS?',
        expectedKeywords: ['point of sale', 'counter', 'receipt', 'inventory'],
        forbiddenKeywords: ['knowledge base', 'chunk_id']
      },
      {
        name: 'Turn 3: Need qualification',
        query: 'Would I need one?',
        expectedKeywords: ['sales', 'stock', 'theft', 'phone'],
        forbiddenKeywords: ['rocket']
      },
      {
        name: 'Turn 4: Pricing inquiry',
        query: 'How much does it cost?',
        expectedKeywords: ['1,500,000', '4,500,000', 'tzs'],
        forbiddenKeywords: ['in tzs or usd']
      }
    ]
  },

  // ─── Scenario C: WhatsApp Social Seller
  {
    scenarioId: 'SCENARIO_C_WHATSAPP_SELLER',
    scenarioTitle: 'Scenario C: WhatsApp Seller Growing Into Dedicated Webstore',
    turns: [
      {
        name: 'Turn 1: State WhatsApp selling channel',
        query: 'I sell through WhatsApp.',
        expectedKeywords: ['whatsapp'],
        forbiddenKeywords: ['rocket']
      },
      {
        name: 'Turn 2: Volume growth pain',
        query: "I'm getting too many orders.",
        expectedKeywords: ['orders', 'catalog'],
        forbiddenKeywords: ['level 0']
      },
      {
        name: 'Turn 3: Chat burial pain',
        query: 'Messages are getting lost.',
        expectedKeywords: ['messages', 'storefront'],
        forbiddenKeywords: ['level 0']
      },
      {
        name: 'Turn 4: Recommendation request',
        query: 'What should I do?',
        expectedKeywords: ['web storefront', 'crm', 'stock'],
        forbiddenKeywords: ['daftari tu']
      }
    ]
  },

  // ─── Scenario D: Excel Limits & Concurrency
  {
    scenarioId: 'SCENARIO_D_EXCEL_LIMITS',
    scenarioTitle: 'Scenario D: Multi-User Excel Failure Diagnosis',
    turns: [
      {
        name: 'Turn 1: Spreadsheet usage',
        query: 'We use Excel.',
        expectedKeywords: ['excel'],
        forbiddenKeywords: ['rocket']
      },
      {
        name: 'Turn 2: Multi-user concurrency',
        query: 'Three employees edit it.',
        expectedKeywords: ['permissions', 'database', 'audit'],
        forbiddenKeywords: ['level 0']
      },
      {
        name: 'Turn 3: Inventory mismatch',
        query: "Sometimes stock doesn't match.",
        expectedKeywords: ['tamper-proof', 'database'],
        forbiddenKeywords: ['whatsapp orders']
      },
      {
        name: 'Turn 4: Viability evaluation',
        query: 'Is Excel still okay for us?',
        expectedKeywords: ['risk', 'permissions', 'audit'],
        forbiddenKeywords: ['daftari']
      }
    ]
  },

  // ─── Scenario E: Denis Chamkaga Profile & Capabilities
  {
    scenarioId: 'SCENARIO_E_DENIS_PROFILE',
    scenarioTitle: 'Scenario E: Denis Chamkaga Authoritative Biography & Contact',
    turns: [
      {
        name: 'Turn 1: Direct profile inquiry',
        query: 'Tell me about Denis Chamkaga.',
        expectedKeywords: ['denis chamkaga', 'information technology', 'years'],
        forbiddenKeywords: ['generic bot', 'i am just a computer']
      },
      {
        name: 'Turn 2: Services provided',
        query: 'What services does he provide?',
        expectedKeywords: ['pos', 'crm', 'erp'],
        forbiddenKeywords: ['rocket']
      },
      {
        name: 'Turn 3: Contact method',
        query: 'How can I contact him?',
        expectedKeywords: ['voice call', 'denis@denischamkaga.com'],
        forbiddenKeywords: ['top-right', 'level 0']
      }
    ]
  },

  // ─── Scenario F: Payment & Post-Payment Onboarding Lifecycle
  {
    scenarioId: 'SCENARIO_F_PAYMENT_AND_DELIVERY',
    scenarioTitle: 'Scenario F: Payment Channels vs Post-Payment Onboarding Differentiation',
    turns: [
      {
        name: 'Turn 1: Payment method channels',
        query: 'How do I pay?',
        expectedKeywords: ['dpo', 'm-pesa', 'tigo pesa', 'airtel money'],
        forbiddenKeywords: ['bitcoin only', 'level 0']
      },
      {
        name: 'Turn 2: Post-payment delivery onboarding',
        query: 'What happens after payment?',
        expectedKeywords: ['receipt', 'kickoff', 'agile', 'training', '30-day'],
        forbiddenKeywords: ['accept m-pesa only']
      },
      {
        name: 'Turn 3: Training confirmation',
        query: 'Do you provide training?',
        expectedKeywords: ['training', '30-day', 'support'],
        forbiddenKeywords: ['no training']
      }
    ]
  }
];

async function runConversationalQualitySuite() {
  console.log('\n================================================================');
  console.log('🤖 MARY OFFLINE DETERMINISTIC CONVERSATIONAL QUALITY GATE');
  console.log('================================================================\n');

  let passedTurns = 0;
  let totalTurns = 0;
  let passedScenarios = 0;
  const failureReports: string[] = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n────────────────────────────────────────────────────────────────`);
    console.log(`📋 Running ${scenario.scenarioTitle}`);
    console.log(`────────────────────────────────────────────────────────────────`);

    // Create fresh isolated session for the multi-turn scenario
    const testVisitorId = `qa_visitor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const session = await prisma.chatSession.create({
      data: {
        visitorId: testVisitorId,
        metadata: {
          clientIp: '127.0.0.1',
          userAgent: 'ConversationalQA/2.0'
        }
      }
    });

    let scenarioPassed = true;

    for (const turn of scenario.turns) {
      totalTurns++;
      const turnStart = Date.now();

      // Collect streamed tokens
      let fullResponse = '';
      const streamHandler = {
        onToken: (token: string) => {
          fullResponse += token;
        },
        onComplete: () => {}
      };

      try {
        await aiOrchestrator.processMessage(
          {
            sessionId: session.id,
            message: turn.query,
            visitorId: testVisitorId
          },
          (token: string) => {
            fullResponse += token;
          }
        );
      } catch (err: any) {
        console.error(`❌ [Error in turn: ${turn.name}]`, err);
        scenarioPassed = false;
        failureReports.push(`[${scenario.scenarioId}] ${turn.name} threw exception: ${err.message}`);
        continue;
      }

      const durationMs = Date.now() - turnStart;
      const lowerResp = fullResponse.toLowerCase();

      // Validate Expected Keywords
      const missingKeywords = turn.expectedKeywords.filter(kw => !lowerResp.includes(kw.toLowerCase()));
      // Validate Forbidden Keywords
      const foundForbidden = turn.forbiddenKeywords.filter(kw => lowerResp.includes(kw.toLowerCase()));

      // Validate Currency Integrity Invariants
      const hasContradictoryCurrency = lowerResp.includes('in tzs or usd') || lowerResp.includes('(in tzs or usd)');
      // Validate Maturity Invariant
      const hasInvalidMaturity = lowerResp.includes('level 0 manual') || lowerResp.includes('level 0 to level 5');
      // Validate RAG Leak Invariant
      const hasRagLeak = lowerResp.includes('knowledge base') || lowerResp.includes('vector_id') || lowerResp.includes('chunk_id');

      const isTurnPass = (
        missingKeywords.length === 0 &&
        foundForbidden.length === 0 &&
        !hasContradictoryCurrency &&
        !hasInvalidMaturity &&
        !hasRagLeak
      );

      if (isTurnPass) {
        passedTurns++;
        console.log(`  ✅ ${turn.name} (${durationMs}ms)`);
      } else {
        scenarioPassed = false;
        const details = [
          missingKeywords.length > 0 ? `Missing: [${missingKeywords.join(', ')}]` : '',
          foundForbidden.length > 0 ? `Found Forbidden: [${foundForbidden.join(', ')}]` : '',
          hasContradictoryCurrency ? 'Violated: Mixed Currency Phrasing' : '',
          hasInvalidMaturity ? 'Violated: Invalid Maturity Level 0' : '',
          hasRagLeak ? 'Violated: RAG/Internal Metadata Leak' : ''
        ].filter(Boolean).join(' | ');

        console.log(`  ❌ ${turn.name} FAILED: ${details}`);
        console.log(`     User Query: "${turn.query}"`);
        console.log(`     Mary Response: "${fullResponse.substring(0, 140)}..."`);
        failureReports.push(`[${scenario.scenarioId}] ${turn.name} -> ${details}`);
      }
    }

    if (scenarioPassed) {
      passedScenarios++;
      console.log(`✨ ${scenario.scenarioId} COMPLETED SUCCESSFULLY (All turns passed)`);
    } else {
      console.log(`⚠️ ${scenario.scenarioId} HAD FAILURES`);
    }

    // Cleanup test session
    try {
      await prisma.aiConversation.deleteMany({ where: { sessionId: session.id } });
      await prisma.chatSession.delete({ where: { id: session.id } });
    } catch (e) {
      // Non-critical test cleanup
    }
  }

  console.log('\n================================================================');
  console.log(`📊 CONVERSATIONAL QUALITY AUDIT SUMMARY:`);
  console.log(`   - Scenarios: ${passedScenarios} / ${SCENARIOS.length} Passed`);
  console.log(`   - Conversational Turns: ${passedTurns} / ${totalTurns} Passed`);
  console.log('================================================================\n');

  if (failureReports.length > 0) {
    console.log('❌ Failure Details:');
    failureReports.forEach(f => console.log(`   - ${f}`));
    process.exit(1);
  } else {
    console.log('🏆 ALL OFFLINE CONVERSATIONAL RULES & INVARIANTS PASSED 100%!');
    process.exit(0);
  }
}

runConversationalQualitySuite().catch((err) => {
  console.error('Fatal test suite failure:', err);
  process.exit(1);
});
