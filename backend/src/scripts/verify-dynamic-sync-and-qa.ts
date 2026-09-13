// backend/src/scripts/verify-dynamic-sync-and-qa.ts
// Real Dynamic Database Synchronization Test & Final Authoritative QA Verification

import prisma from '../config/database';
import { databaseKnowledgeProvider } from '../ai/providers/database-knowledge.provider';
import { aiKnowledgeEngine } from '../ai/knowledge-engine';
import { aiPromptBuilder } from '../ai/prompt-builder';

export async function runDynamicSyncTest() {
  console.log('\n================================================================');
  console.log('🔄 EXECUTING CONTROLLED DYNAMIC DATABASE SYNCHRONIZATION TEST');
  console.log('================================================================\n');

  // 1. Fetch real active service from PostgreSQL database
  let service = await prisma.service.findFirst({ where: { isActive: true } });
  
  if (!service) {
    console.log('Creating initial test service in database...');
    service = await prisma.service.create({
      data: {
        title: 'Custom POS & Inventory Automation Engine',
        slug: 'pos-inventory-automation',
        description: 'Enterprise point of sale system with barcode batching and daily audit reports.',
        content: 'Enterprise point of sale system with barcode batching and daily audit reports.',
        icon: 'Database',
        features: ['Stock Control', 'Barcode Batching', 'Daily Reports'],
        technologies: ['PostgreSQL', 'React', 'Node.js'],
        isActive: true,
        displayOrder: 1
      }
    });
  }

  const originalDesc = service.description;
  const targetId = service.id;
  const title = service.title;

  console.log(`📌 Found DB Service: "${title}"`);
  console.log(`   Original Description: "${originalDesc}"\n`);

  // Step 2: Clear cache & query BEFORE update
  databaseKnowledgeProvider.clearCache();
  const preUpdateDocs = await aiKnowledgeEngine.retrieveWithConfidence(title, 3);
  console.log(`BEFORE UPDATE - Retrieved ${preUpdateDocs.documents.length} docs. Top Title: "${preUpdateDocs.documents[0]?.title}"`);

  // Step 3: Mutate Authoritative DB Record
  const updatedTag = `[UPDATED REAL-TIME: 24/7 Cloud Sync & Instant WhatsApp Alerts Included ${Date.now()}]`;
  const updatedDesc = `${originalDesc} ${updatedTag}`;

  await prisma.service.update({
    where: { id: targetId },
    data: { description: updatedDesc }
  });

  console.log(`\n✏️ MUTATED DATABASE RECORD: Updated description in PostgreSQL.`);

  // Step 4: Re-index / Invalidate Cache
  databaseKnowledgeProvider.clearCache();
  console.log(`🔄 INVALIDATED KNOWLEDGE CACHE: Re-indexing dynamic DB provider...`);

  // Step 5: Query AFTER update
  const postUpdateDocs = await aiKnowledgeEngine.retrieveWithConfidence(title, 3);
  const matchedDoc = postUpdateDocs.documents.find(d => d.content.includes(updatedTag));

  console.log(`AFTER UPDATE  - Retrieved ${postUpdateDocs.documents.length} docs.`);
  console.log(`   Contains Updated Tag? ${matchedDoc ? '✅ YES' : '❌ NO'}`);

  // Step 6: Test Mary Response with Updated DB Context
  const systemPrompt = aiPromptBuilder.build({
    userRole: 'visitor',
    userName: 'Verification Client',
    currentLanguage: 'en',
    knowledge: postUpdateDocs.documents,
    chatHistory: [],
    businessRules: [],
    facts: [],
    allowedCards: [],
    presenceState: 'Online'
  } as any);

  const contextText = systemPrompt.map(m => m.content).join('\n');
  const maryContainsUpdate = contextText.includes('24/7 Cloud Sync & Instant WhatsApp Alerts Included');

  console.log(`   Assembled LLM Context Contains Updated DB Data? ${maryContainsUpdate ? '✅ YES' : '❌ NO'}`);

  // Step 7: Restore Original DB Record
  await prisma.service.update({
    where: { id: targetId },
    data: { description: originalDesc }
  });

  databaseKnowledgeProvider.clearCache();
  console.log(`\n🧹 RESTORED ORIGINAL DATABASE RECORD & CLEARED CACHE.`);

  const syncSuccess = Boolean(matchedDoc && maryContainsUpdate);
  console.log(`\n================================================================`);
  console.log(`📊 DYNAMIC SYNC RESULT: ${syncSuccess ? '✅ PASSED (100% Real-Time DB Sync)' : '❌ FAILED'}`);
  console.log('================================================================\n');

  return syncSuccess;
}

if (process.argv[1]?.includes('verify-dynamic-sync-and-qa')) {
  runDynamicSyncTest()
    .then((passed) => process.exit(passed ? 0 : 1))
    .catch((err) => {
      console.error('Sync Test Error:', err);
      process.exit(1);
    });
}
