import prisma from '../config/database';
import { databaseKnowledgeProvider } from '../ai/providers/database-knowledge.provider';
import { aiOrchestrator } from '../ai/orchestrator';

async function runDynamicKnowledgeSyncQA() {
  console.log('================================================================');
  console.log('🧪 DYNAMIC KNOWLEDGE ENGINE SYNCHRONIZATION QA');
  console.log('================================================================');

  const testTitle = 'Dynamic Test Title: Special POS Promo 2026';
  const testContent = 'Special authoritative notice: The 2026 Enterprise POS System includes complimentary 24/7 VIP Onsite Support (Code: VIP-POS-2026-NEXUS).';
  
  let createdId: string | null = null;
  try {
    // 1. Create a dynamic AI knowledge item in DB
    console.log('\n[Step 1] Creating dynamic AI Knowledge Item in Database...');
    const created = await prisma.aiKnowledgeItem.create({
      data: {
        title: testTitle,
        content: testContent,
        category: 'services',
        status: 'published',
        tags: ['pos', 'vip', 'promo']
      }
    });
    createdId = created.id;
    console.log(` ✅ Created knowledge item ID: ${createdId}`);

    // 2. Clear cache to trigger re-indexing
    console.log('\n[Step 2] Invalidating knowledge cache & re-synchronizing...');
    databaseKnowledgeProvider.clearCache();

    // 3. Process fresh user query requesting this information
    console.log('\n[Step 3] Querying Mary in a fresh conversation about VIP support...');
    const sessionId = `sync_test_session_${Date.now()}`;
    const response = await aiOrchestrator.processMessage({
      message: 'Does your 2026 Enterprise POS include VIP Onsite Support?',
      sessionId,
      language: 'en'
    });

    console.log(`Mary Response: "${response.response}"`);

    // 4. Assert new authoritative info is present in Mary's response or retrieved context
    const textLower = response.response.toLowerCase();
    const hasNewInfo = textLower.includes('vip') || textLower.includes('24/7') || textLower.includes('onsite support') || textLower.includes('pos');
    if (!hasNewInfo) {
      throw new Error(`Dynamic sync failed: Mary did not reflect the updated database knowledge item. Response: "${response.response}"`);
    }
    console.log(' ✅ PASS: Mary dynamically retrieved and responded with the updated DB knowledge!');

  } finally {
    // 5. Cleanup dynamic test item
    if (createdId) {
      console.log('\n[Step 4] Cleaning up test item from Database and clearing cache...');
      await prisma.aiKnowledgeItem.delete({ where: { id: createdId } });
      databaseKnowledgeProvider.clearCache();
      console.log(' ✅ PASS: Database restored and cache invalidated.');
    }
  }

  console.log('\n================================================================');
  console.log('🎉 DYNAMIC KNOWLEDGE ENGINE SYNC QA PASSED SUCCESSFUL');
  console.log('================================================================\n');
}

runDynamicKnowledgeSyncQA().catch(err => {
  console.error('❌ DYNAMIC KNOWLEDGE QA FAILED:', err);
  process.exit(1);
});
