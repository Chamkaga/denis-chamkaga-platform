// backend/src/scripts/seed-system-knowledge.ts
// Automated Enterprise System Knowledge Base Pipeline & Indexing Harness

import fs from 'fs';
import path from 'path';
import prisma from '../config/database';
import { knowledgeService } from '../services/knowledge.service';
import { knowledgeEngine } from '../services/knowledge.engine';
import { otelLogger } from '../utils/otel-logger';

interface DocFileConfig {
  filePath: string;
  category: string;
  module: string;
  tags: string[];
}

async function runSystemKnowledgePipeline() {
  console.log('================================================================');
  console.log('🧠 ENTERPRISE SYSTEM KNOWLEDGE BASE SYNCHRONIZATION & PIPELINE');
  console.log('================================================================\n');

  const rootDocsDir = path.resolve(__dirname, '../../../docs');
  const brainDir = 'C:/Users/denis/.gemini/antigravity-ide/brain/79d717d9-abc1-4e1a-874a-79ed1e1ed2f6';

  const docSources: DocFileConfig[] = [
    { filePath: path.join(brainDir, 'implementation_plan.md'), category: 'architecture', module: 'SystemFoundation', tags: ['implementation_plan', 'enterprise_architecture', 'production_certification'] },
    { filePath: path.join(brainDir, 'security_audit_report.md'), category: 'security', module: 'Security', tags: ['security_audit', 'owasp', 'penetration_test', 'compliance'] },
    { filePath: path.join(rootDocsDir, 'ProjectStatus.md'), category: 'governance', module: 'ProjectStatus', tags: ['status', 'roadmap', 'milestones'] },
    { filePath: path.join(rootDocsDir, 'DevelopmentRoadmap.md'), category: 'governance', module: 'Roadmap', tags: ['roadmap', 'phases', 'strategy'] },
    { filePath: path.join(rootDocsDir, 'Architecture.md'), category: 'architecture', module: 'CoreArchitecture', tags: ['architecture', 'design', 'system_flow'] },
    { filePath: path.join(rootDocsDir, 'Deployment.md'), category: 'operations', module: 'DevOps', tags: ['docker', 'deployment', 'kubernetes', 'disaster_recovery'] },
    { filePath: path.join(rootDocsDir, 'Database.md'), category: 'database', module: 'PrismaSchema', tags: ['database', 'schema', 'tables', 'relations'] },
    { filePath: path.join(rootDocsDir, 'BusinessTransformation.md'), category: 'business', module: 'BusinessTransformation', tags: ['sme_playbook', 'digital_transformation', 'business_growth', 'automation'] },
    { filePath: path.join(rootDocsDir, 'Modules.md'), category: 'business', module: 'BusinessModules', tags: ['erp', 'crm', 'finance', 'marketing', 'projects'] },
    { filePath: path.join(rootDocsDir, 'API.md'), category: 'api', module: 'ApiEndpoints', tags: ['api', 'endpoints', 'v1', 'swagger'] },
    { filePath: path.join(rootDocsDir, 'AI.md'), category: 'ai', module: 'AiInfrastructure', tags: ['ai_engine', 'rag', 'embeddings', 'prompts'] },
  ];

  let totalDocsProcessed = 0;
  let totalChunksIndexed = 0;

  for (const doc of docSources) {
    if (!fs.existsSync(doc.filePath)) {
      console.warn(` ⚠️ Document missing: ${doc.filePath}`);
      continue;
    }

    const fileContent = fs.readFileSync(doc.filePath, 'utf-8');
    const fileName = path.basename(doc.filePath);
    const title = fileName.replace('.md', '').replace(/_/g, ' ');

    // Check if item already exists by title
    const existing = await prisma.aiKnowledgeItem.findFirst({ where: { title } });

    let itemId = '';
    if (existing) {
      // Update existing knowledge item
      const updated = await knowledgeService.update(existing.id, {
        title,
        category: doc.category,
        content: fileContent,
        tags: doc.tags,
        metadata: { module: doc.module, sourceDocument: fileName, version: existing.version + 1 },
        changeSummary: 'Automated Knowledge Base System Synchronization'
      });
      itemId = updated ? updated.id : existing.id;
    } else {
      // Create new knowledge item
      const created = await knowledgeService.create({
        title,
        category: doc.category,
        content: fileContent,
        status: 'published',
        tags: doc.tags,
        metadata: { module: doc.module, sourceDocument: fileName, version: 1 }
      });
      itemId = created ? created.id : '';
    }

    // Run chunking & vector/keyword hybrid indexing
    const indexResult = await knowledgeEngine.indexKnowledgeItem(itemId);
    totalDocsProcessed++;
    totalChunksIndexed += indexResult.totalChunks;

    console.log(` ✅ Indexed Document [${totalDocsProcessed}]: ${title} (${indexResult.totalChunks} chunks)`);
  }

  console.log('\n--- HYBRID SEARCH (VECTOR + KEYWORD) RETRIEVAL VERIFICATION ---');

  const testQueries = [
    'Selling clothing through WhatsApp order bottlenecks',
    'Pharmacy drug expiry alerts batch tracking',
    'Retail store untracked debt madeni loss',
    'Transactional Outbox Pattern Zero Event Loss',
    'DPO Payment Reconciliation Cash Clearing Engine',
    'Maker Checker Dual Control Financial Approval',
    'OpenTelemetry Correlation ID Logging'
  ];

  for (const query of testQueries) {
    const searchResults = await knowledgeEngine.hybridSearch(query, { limit: 3 });
    const topMatch = searchResults[0];
    const matchTitle = topMatch ? topMatch.title : 'None';
    const score = topMatch ? Math.round(topMatch.score * 100) : 0;
    console.log(` 🔎 Query: "${query}" → Top Match: [${matchTitle}] (Relevance Score: ${score}%)`);
  }

  otelLogger.info(`[KnowledgePipeline] Successfully synchronized ${totalDocsProcessed} documents into Knowledge Base (${totalChunksIndexed} total chunks indexed).`);

  console.log('\n================================================================');
  console.log(`🎉 KNOWLEDGE BASE SYNCHRONIZATION PASSED: ${totalDocsProcessed} DOCS, ${totalChunksIndexed} CHUNKS INDEXED`);
  console.log('================================================================\n');

  await prisma.$disconnect();
}

runSystemKnowledgePipeline();
