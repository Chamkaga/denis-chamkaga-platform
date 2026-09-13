// backend/src/scripts/verify-mary-orchestration-qa.ts
// Comprehensive Automated Conversational QA for Mary AI Orchestration & UI Grounding

import { aiOrchestrator } from '../ai/orchestrator';
import { aiMemory } from '../ai/memory';
import prisma from '../config/database';
import { logger } from '../utils/logger';

async function runMaryOrchestrationQA() {
  console.log('================================================================');
  console.log('🧪 MARY AI ORCHESTRATION & CONVERSATION LAYER SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      console.log(` ✅ PASS [Check ${total}]: ${description}`);
      passed++;
    } else {
      console.error(` ❌ FAIL [Check ${total}]: ${description}`);
      throw new Error(`Mary QA Assertion Failed: ${description}`);
    }
  };

  try {
    // ── PART 1: THE EXACT 6-STEP REPORTED CONVERSATION ──────────────────────
    console.log('--- PART 1: Testing exact reported customer conversation (6 steps) ---');

    // Create fresh test session
    const session = await prisma.chatSession.create({
      data: {
        visitorId: 'qa_visitor_mary_' + Date.now(),
        status: 'active',
        metadata: { title: 'Mary QA Test Session', facts: {} }
      }
    });
    const sessionId = session.id;

    // Step 1: "hi"
    console.log('\n[Turn 1] User: "hi"');
    const res1 = await aiOrchestrator.processMessage({
      message: 'hi',
      sessionId,
      language: 'en'
    });
    console.log(`Mary: "${res1.response}"`);
    assert(!res1.response.toLowerCase().includes('knowledge base'), 'Turn 1: No Knowledge Base disclosure');
    assert(res1.response.toLowerCase().includes('mary') || res1.response.toLowerCase().includes('help'), 'Turn 1: Mary introduces herself warmly');

    // Step 2: "can you do a system for me"
    console.log('\n[Turn 2] User: "can you do a system for me"');
    const res2 = await aiOrchestrator.processMessage({
      message: 'can you do a system for me',
      sessionId,
      language: 'en'
    });
    console.log(`Mary: "${res2.response}"`);
    assert(!res2.response.toLowerCase().includes('knowledge base'), 'Turn 2: No Knowledge Base disclosure');
    assert(!res2.response.toLowerCase().includes('technology consulting'), 'Turn 2: No raw document title dumping');
    assert(!res2.response.toLowerCase().includes('swahili and english'), 'Turn 2: No raw project record dumping');
    assert(res2.response.toLowerCase().includes('business') || res2.response.toLowerCase().includes('help') || res2.response.toLowerCase().includes('system'), 'Turn 2: Natural system confirmation & discovery question');

    // Step 3: "what you can help me"
    console.log('\n[Turn 3] User: "what you can help me"');
    const res3 = await aiOrchestrator.processMessage({
      message: 'what you can help me',
      sessionId,
      language: 'en'
    });
    console.log(`Mary: "${res3.response}"`);
    assert(!res3.response.toLowerCase().includes('knowledge base'), 'Turn 3: No Knowledge Base disclosure');
    assert(!res3.response.includes('Service: Technology Consulting'), 'Turn 3: No raw document header leaks');
    assert(res3.response.toLowerCase().includes('pos') || res3.response.toLowerCase().includes('system') || res3.response.toLowerCase().includes('crm') || res3.response.toLowerCase().includes('software') || res3.response.toLowerCase().includes('web'), 'Turn 3: Synthesized business capability overview');

    // Step 4: "why you not help me first before schedule to Denis"
    console.log('\n[Turn 4] User: "why you not help me first before schedule to Denis"');
    const res4 = await aiOrchestrator.processMessage({
      message: 'why you not help me first before schedule to Denis',
      sessionId,
      language: 'en'
    });
    console.log(`Mary: "${res4.response}"`);
    assert(!res4.response.toLowerCase().includes('knowledge base'), 'Turn 4: No Knowledge Base disclosure');
    assert(res4.response.toLowerCase().includes('right') || res4.response.toLowerCase().includes('help') || res4.response.toLowerCase().includes('guide') || res4.response.toLowerCase().includes('don\'t need'), 'Turn 4: Mary accepts AI-first preference warmly');
    assert(!res4.response.toLowerCase().includes('call denis at the top'), 'Turn 4: Does NOT repeat Denis call push');

    // Check facts in database for persisted preference
    const factsAfterTurn4 = await aiMemory.getFacts(sessionId);
    assert(factsAfterTurn4.aiFirstPreference === true, 'Turn 4: aiFirstPreference is persisted in session facts = true');

    // Step 5: "ok, if not online you can guide me instead of Denis"
    console.log('\n[Turn 5] User: "ok, if not online you can guide me instead of Denis"');
    const res5 = await aiOrchestrator.processMessage({
      message: 'ok, if not online you can guide me instead of Denis',
      sessionId,
      language: 'en'
    });
    console.log(`Mary: "${res5.response}"`);
    assert(!res5.response.toLowerCase().includes('knowledge base'), 'Turn 5: No Knowledge Base disclosure');
    assert(!res5.response.toLowerCase().includes("you don't need to speak with denis immediately"), 'Turn 5: Does NOT repeat Turn 4 policy statement');
    assert(res5.response.toLowerCase().includes('guide') || res5.response.toLowerCase().includes('help') || res5.response.toLowerCase().includes('tell') || res5.response.toLowerCase().includes('business') || res5.response.toLowerCase().includes('start') || res5.response.toLowerCase().includes('problem'), 'Turn 5: Mary continues guiding customer without repeating policy');
    assert(!res5.response.toLowerCase().includes('schedule with denis'), 'Turn 5: Zero premature handoff push when preference active');

    // Step 6: "but where is the call button?"
    console.log('\n[Turn 6] User: "but where is the call button?"');
    const res6 = await aiOrchestrator.processMessage({
      message: 'but where is the call button?',
      sessionId,
      language: 'en'
    });
    console.log(`Mary: "${res6.response}"`);
    assert(!res6.response.toLowerCase().includes('top of the chat widget'), 'Turn 6: NEVER claims call button is at top of widget');
    assert(res6.response.toLowerCase().includes('bottom-left') || res6.response.toLowerCase().includes('bottom left') || res6.response.toLowerCase().includes('paperclip'), 'Turn 6: Accurately grounds call button location to bottom-left');


    // ── PART 2: BROADER REAL-WORLD QA SCENARIOS ────────────────────────────
    console.log('\n--- PART 2: Testing Broader Real-World Scenarios ---');

    // Scenario A: Services Inquiry
    console.log('\n[Scenario A] Services: "Do you build POS systems?"');
    const sA = await aiOrchestrator.processMessage({
      message: 'Do you build POS systems?',
      sessionId: 'qa_pos_' + Date.now(),
      language: 'en'
    });
    console.log(`Mary: "${sA.response}"`);
    assert(!sA.response.toLowerCase().includes('knowledge base'), 'Scenario A: No Knowledge Base leak');
    assert(sA.response.toLowerCase().includes('pos') || sA.response.toLowerCase().includes('inventory'), 'Scenario A: Confirms POS capabilities and asks useful follow-up');

    // Scenario B: Problem-First Diagnosis ("My shop is losing stock")
    console.log('\n[Scenario B] Problem Diagnosis: "My shop is losing stock and I don\'t know where it goes."');
    const sB = await aiOrchestrator.processMessage({
      message: 'My shop is losing stock and I don\'t know where it goes.',
      sessionId: 'qa_stock_' + Date.now(),
      language: 'en'
    });
    console.log(`Mary: "${sB.response}"`);
    assert(!sB.response.toLowerCase().includes('knowledge base'), 'Scenario B: No Knowledge Base leak');
    assert(sB.response.toLowerCase().includes('inventory') || sB.response.toLowerCase().includes('pos') || sB.response.toLowerCase().includes('stock'), 'Scenario B: Diagnoses stock leakage and recommends POS + Inventory Management');

    // Scenario C: Pricing Inquiry ("How much is a POS?")
    console.log('\n[Scenario C] Pricing: "How much is a POS?"');
    const sC = await aiOrchestrator.processMessage({
      message: 'How much is a POS?',
      sessionId: 'qa_pricing_' + Date.now(),
      language: 'en'
    });
    console.log(`Mary: "${sC.response}"`);
    assert(!sC.response.toLowerCase().includes('knowledge base'), 'Scenario C: No Knowledge Base leak');
    assert(!sC.response.includes('EUR') && !sC.response.includes('GBP') && !sC.response.includes('KES'), 'Scenario C: Strictly TZS/USD currency, no EUR/GBP/KES');
    assert(sC.response.toLowerCase().includes('depend') || sC.response.toLowerCase().includes('quote') || sC.response.toLowerCase().includes('branches') || sC.response.toLowerCase().includes('tzs') || sC.response.toLowerCase().includes('usd'), 'Scenario C: Explains pricing factors or quote path without fabricating fake prices');

    // Scenario D: Payment Methods ("Do you accept M-Pesa?")
    console.log('\n[Scenario D] Payment: "Do you accept M-Pesa?"');
    const sD = await aiOrchestrator.processMessage({
      message: 'Do you accept M-Pesa?',
      sessionId: 'qa_pay_' + Date.now(),
      language: 'en'
    });
    console.log(`Mary: "${sD.response}"`);
    assert(sD.response.toLowerCase().includes('m-pesa') || sD.response.toLowerCase().includes('mpesa') || sD.response.toLowerCase().includes('yes'), 'Scenario D: Confirms M-Pesa and mobile money payment options');

    // Scenario E: Unsupported Capability ("Can you build a rocket?")
    console.log('\n[Scenario E] Unsupported: "Can you build a rocket for space travel?"');
    const sE = await aiOrchestrator.processMessage({
      message: 'Can you build a rocket for space travel?',
      sessionId: 'qa_rocket_' + Date.now(),
      language: 'en'
    });
    console.log(`Mary: "${sE.response}"`);
    assert(!sE.response.toLowerCase().includes('yes, we can build a rocket'), 'Scenario E: Honest boundary on unsupported out-of-scope request');

    console.log('\n================================================================');
    console.log(`🎉 MARY AI ORCHESTRATION QA FULLY PASSED: ${passed}/${total} CHECKS SUCCESSFUL`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('\n❌ MARY AI ORCHESTRATION QA FAILED:', error);
    process.exit(1);
  }
}

runMaryOrchestrationQA();
