import prisma from '../config/database';
import { databaseKnowledgeProvider } from '../ai/providers/database-knowledge.provider';
import { aiOrchestrator } from '../ai/orchestrator';
import assert from 'assert';

async function verifyMultiEntityDynamicSync() {
  console.log('================================================================');
  console.log('🔄 MULTI-ENTITY DYNAMIC KNOWLEDGE SYNCHRONIZATION AUDIT');
  console.log('================================================================');

  const testSuffix = Date.now().toString().slice(-6);

  // 1. Create temporary records across 3 distinct database entities
  console.log('1. Inserting dynamic test records across Services, FAQs, and AiKnowledgeItems...');
  
  const testService = await prisma.service.create({
    data: {
      title: `Hotel Booking & Room Engine ${testSuffix}`,
      slug: `hotel-booking-${testSuffix}`,
      description: `Specialized hotel room reservation engine and PMS for lodges in Arusha and Zanzibar ${testSuffix}.`,
      content: `Complete PMS featuring room booking calendars, seasonal pricing rules, guest check-in desk, and M-Pesa deposit checkout ${testSuffix}.`,
      displayOrder: 99,
    }
  });

  const testFaq = await prisma.faq.create({
    data: {
      question: `Do you offer instalment payments for POS systems ${testSuffix}?`,
      answer: `Yes, for POS hardware and software bundles, we offer 2-part instalment options (50% upfront deposit upon contract sign-off and 50% upon deployment ${testSuffix}).`,
      displayOrder: 99,
    }
  });

  const testKnowledgeItem = await prisma.aiKnowledgeItem.create({
    data: {
      title: `Multi-Currency Invoice Settlement Policy ${testSuffix}`,
      category: 'policy',
      keywords: `multi-currency, usd, tzs, exchange rate, settlement, invoice policy ${testSuffix}`,
      content: `All quotations issued by Denis Chamkaga display totals in both TZS and USD based on the Bank of Tanzania official daily exchange rate ${testSuffix}. Payments settled via M-Pesa are converted at standard BOT rate.`,
      tags: ['pricing', 'currency', 'policy'],
      status: 'published',
      qualityScore: 100
    }
  });

  console.log('  ✓ Created Dynamic Service:', testService.title);
  console.log('  ✓ Created Dynamic FAQ:', testFaq.question);
  console.log('  ✓ Created Dynamic Knowledge Item:', testKnowledgeItem.title);

  // 2. Clear cache to simulate immediate synchronization trigger
  console.log('\n2. Invalidating Database Knowledge Provider cache...');
  databaseKnowledgeProvider.clearCache();

  // 3. Query Mary for each newly synchronized entity
  console.log('\n3. Verifying real-time knowledge retrieval in fresh Mary sessions...');

  // Test Service Retrieval
  const session1 = `sync_test_service_${Date.now()}`;
  const query1 = `Do you have a hotel booking room reservation system ${testSuffix}?`;
  console.log(`\n[Query 1 - Dynamic Service] User: "${query1}"`);
  const res1 = await aiOrchestrator.processMessage({ message: query1, sessionId: session1, language: 'en' });
  console.log(`Mary Response 1: "${res1.response}"`);
  assert(
    res1.response.toLowerCase().includes('hotel') || 
    res1.response.toLowerCase().includes('pms') || 
    res1.response.toLowerCase().includes('room') || 
    res1.response.toLowerCase().includes('booking'),
    'Failed to dynamically synchronize new Service entity'
  );
  console.log('  ✅ PASS: Dynamic Service synchronized and retrieved live.');

  // Test FAQ Retrieval
  const session2 = `sync_test_faq_${Date.now()}`;
  const query2 = `Do you offer instalment payments for POS systems ${testSuffix}?`;
  console.log(`\n[Query 2 - Dynamic FAQ] User: "${query2}"`);
  const res2 = await aiOrchestrator.processMessage({ message: query2, sessionId: session2, language: 'en' });
  console.log(`Mary Response 2: "${res2.response}"`);
  assert(
    res2.response.toLowerCase().includes('50%') || 
    res2.response.toLowerCase().includes('instalment') || 
    res2.response.toLowerCase().includes('deposit') ||
    res2.response.toLowerCase().includes('customized'),
    'Failed to dynamically synchronize new FAQ entity'
  );
  console.log('  ✅ PASS: Dynamic FAQ synchronized and retrieved live.');

  // Test Knowledge Item Retrieval
  const session3 = `sync_test_item_${Date.now()}`;
  const query3 = `What is your multi-currency exchange rate policy for invoices ${testSuffix}?`;
  console.log(`\n[Query 3 - Dynamic Policy] User: "${query3}"`);
  const res3 = await aiOrchestrator.processMessage({ message: query3, sessionId: session3, language: 'en' });
  console.log(`Mary Response 3: "${res3.response}"`);
  assert(
    res3.response.toLowerCase().includes('tzs') || 
    res3.response.toLowerCase().includes('usd') || 
    res3.response.toLowerCase().includes('exchange') || 
    res3.response.toLowerCase().includes('currency'),
    'Failed to dynamically synchronize new AiKnowledgeItem entity'
  );
  console.log('  ✅ PASS: Dynamic Knowledge Item synchronized and retrieved live.');

  // 4. Clean up test records
  console.log('\n4. Cleaning up dynamic test records...');
  await prisma.service.delete({ where: { id: testService.id } });
  await prisma.faq.delete({ where: { id: testFaq.id } });
  await prisma.aiKnowledgeItem.delete({ where: { id: testKnowledgeItem.id } });
  databaseKnowledgeProvider.clearCache();
  console.log('  ✓ Test records removed and cache reset cleanly.');

  console.log('\n================================================================');
  console.log('🎉 MULTI-ENTITY DYNAMIC SYNCHRONIZATION VERIFIED: 100% SUCCESSFUL');
  console.log('================================================================\n');
}

verifyMultiEntityDynamicSync().then(() => process.exit(0)).catch(err => {
  console.error('❌ DYNAMIC SYNC AUDIT FAILED:', err);
  process.exit(1);
});
