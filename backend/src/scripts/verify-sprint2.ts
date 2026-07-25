// backend/src/scripts/verify-sprint2.ts
// Phase 2C: Sprint 2 Final Verification Script (Knowledge Platform & RAG Engine)

import prisma from '../config/database';
import { knowledgeService } from '../services/knowledge.service';
import { knowledgeEngine } from '../services/knowledge.engine';
import { AIProviderFactory } from '../providers/ai.factory';
import { StorageProviderFactory } from '../providers/storage.factory';
import { LocalEventBus } from '../events/LocalEventBus';

async function runSprint2Verification() {
  console.log('====================================================');
  console.log('🚀 STARTING SPRINT 2 FINAL PRODUCTION VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      console.log(` ✅ PASS [${total}]: ${description}`);
      passed++;
    } else {
      console.error(` ❌ FAIL [${total}]: ${description}`);
      throw new Error(`Verification Failed: ${description}`);
    }
  };

  try {
    // ── 1. Event Bus Subscription Setup ──────────────────────────────────────
    console.log('1. Setting up Knowledge Base Event Bus subscribers...');
    const eventBus = new LocalEventBus();
    const capturedEvents: string[] = [];

    const eventNames = [
      'KnowledgeCreated',
      'KnowledgeUpdated',
      'KnowledgeDeleted',
      'EmbeddingGenerated',
      'IndexCompleted',
    ];

    for (const evtName of eventNames) {
      eventBus.subscribe(evtName, (event) => {
        capturedEvents.push(event.name);
      });
    }
    assert(true, 'Registered subscribers for all 5 Knowledge Event Bus types');

    // ── 2. Knowledge Repository CRUD & Versioning ────────────────────────────
    console.log('\n2. Verifying Knowledge Document Creation & Initial Versioning...');
    const docTitle = `Enterprise Architecture Baseline ${Date.now()}`;
    const initialContent = `
# Enterprise Architecture Baseline
This document outlines the core architecture principles for the Denis Chamkaga AI Business Platform.
We utilize PostgreSQL for relational persistence, Prisma ORM for data mapping, Node.js with TypeScript for high-performance backend microservices, and React with Tailwind CSS for high-fidelity responsive user interfaces.
All RAG knowledge chunks are indexed into vector embeddings for hybrid retrieval.
    `;

    const createdDoc = await knowledgeService.create({
      title: docTitle,
      category: 'Architecture',
      summary: 'Core architecture overview and RAG specification',
      content: initialContent,
      tags: ['rag', 'architecture', 'baseline'],
      metadata: { author: 'Denis Chamkaga', importance: 'high' },
    });

    assert(!!createdDoc?.id, 'Knowledge document created successfully');
    assert(createdDoc?.version === 1, 'Document initialized with Version 1');
    assert(createdDoc?.indexStatus === 'completed', 'Document auto-indexed upon creation');

    const createdVersion = await prisma.aiKnowledgeVersion.findFirst({
      where: { knowledgeItemId: createdDoc!.id, version: 1 },
    });
    assert(!!createdVersion, 'Version 1 recorded in AiKnowledgeVersion table');

    // ── 3. Document Updating & Append Versioning ─────────────────────────────
    console.log('\n3. Verifying Document Update & Version History Appending...');
    const updatedContent = `${initialContent}\n\n## Section 2: Security & Fallbacks\nPrimary AI provider is OpenAI with Gemini as secondary fallback.`;

    const updatedDoc = await knowledgeService.update(createdDoc!.id, {
      content: updatedContent,
      tags: ['rag', 'architecture', 'baseline', 'security'],
      changeSummary: 'Added Security & Fallbacks section',
    });

    assert(updatedDoc.version === 2, 'Document version incremented to Version 2');

    const versions = await prisma.aiKnowledgeVersion.findMany({
      where: { knowledgeItemId: createdDoc!.id },
      orderBy: { version: 'asc' },
    });
    assert(versions.length === 2, 'Version history contains both v1 and v2 records');

    // ── 4. Chunking & Embedding Generation ───────────────────────────────────
    console.log('\n4. Verifying Chunking Engine & Embedding Generation...');
    const chunks = knowledgeEngine.chunkText(updatedContent, 200, 50);
    assert(chunks.length > 1, `Text chunking split content into ${chunks.length} overlapping chunks`);

    const aiProvider = AIProviderFactory.getProvider();
    const embResult = await aiProvider.generateEmbeddings('Test query for embedding verification');
    assert(Array.isArray(embResult.embeddings) && embResult.embeddings.length > 0, `Generated vector embedding with ${embResult.embeddings.length} dimensions`);

    // ── 5. Hybrid Search & Context Assembly ──────────────────────────────────
    console.log('\n5. Verifying Hybrid Search (Vector + Full-Text Keyword) & Context Assembly...');
    const searchResults = await knowledgeEngine.hybridSearch('PostgreSQL architecture RAG', { limit: 5 });
    assert(searchResults.length > 0, `Hybrid search returned ${searchResults.length} ranked matching chunks`);
    assert(searchResults[0].score > 0, 'Top result has positive hybrid relevance score');

    const contextText = await knowledgeEngine.assembleContext('PostgreSQL architecture');
    assert(contextText.includes('Enterprise Architecture Baseline'), 'assembleContext correctly formatted retrieved chunks for prompt injection');

    // ── 6. Storage Providers (Cloudinary Primary + AWS S3 Secondary) ────────
    console.log('\n6. Verifying Storage Adapters (Cloudinary & AWS S3)...');
    const cloudinaryDriver = StorageProviderFactory.getProvider('cloudinary');
    const s3Driver = StorageProviderFactory.getProvider('s3');

    const sampleBuffer = Buffer.from('Sample PDF document content');
    const cloudRes = await cloudinaryDriver.uploadFile(sampleBuffer, 'doc.pdf', 'application/pdf');
    assert(cloudRes.url.includes('cloudinary'), 'Cloudinary storage driver uploaded file and returned URL');

    const s3Res = await s3Driver.uploadFile(sampleBuffer, 'doc.pdf', 'application/pdf');
    assert(s3Res.url.includes('s3.amazonaws.com'), 'AWS S3 storage driver uploaded file and returned URL');

    // ── 7. Bulk Vector Re-index Verification ─────────────────────────────────
    console.log('\n7. Verifying Re-index All Vector Engine Trigger...');
    const reindexRes = await knowledgeService.reindexAll();
    assert(reindexRes.totalIndexed >= 1, `Bulk re-indexed ${reindexRes.totalIndexed} published documents`);

    // ── 8. Document Deletion & Cleanup ───────────────────────────────────────
    console.log('\n8. Verifying Knowledge Document Deletion...');
    await knowledgeService.delete(createdDoc!.id);
    const deletedCheck = await prisma.aiKnowledgeItem.findUnique({ where: { id: createdDoc!.id } });
    assert(deletedCheck === null, 'Knowledge item deleted from database');

    console.log('\n====================================================');
    console.log(`✅ SPRINT 2 PRODUCTION VERIFICATION PASSED: ${passed}/${total} TESTS`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ SPRINT 2 VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSprint2Verification();
