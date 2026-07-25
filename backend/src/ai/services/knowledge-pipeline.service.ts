// src/ai/services/knowledge-pipeline.service.ts
// Knowledge Processing Pipeline — separates all processing logic from the CRUD layer.
//
// Pipeline stages (executed sequentially):
//   1. Validate         → enforce required fields + valid status/source
//   2. Normalize        → trim / collapse whitespace / clean content
//   3. Metadata Gen     → stamp createdBy / updatedBy / timestamps
//   4. Keyword Extract  → BM25-aligned token extraction (stop-word filtered)
//   5. Duplicate Detect → Jaccard similarity against existing published items (≥0.75 = warning)
//   6. Version Snapshot → write AiKnowledgeVersion row on updates
//   7. BM25 Index Prep  → clear cache + stamp lastIndexedAt / indexStatus
//   8. Event Publish    → emit typed Knowledge event to aiEventBus
//   9. Audit Log        → write business_activities row

import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { aiEventBus } from '../event-bus';
import databaseKnowledgeProvider from '../providers/database-knowledge.provider';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = ['draft', 'review', 'published', 'needs_review', 'archived', 'review_due', 'needs_update'] as const;
type KnowledgeStatus = typeof VALID_STATUSES[number];

const VALID_SOURCES = [
  'manual', 'faq', 'service', 'project', 'crm', 'portfolio',
  'import', 'ai_generated', 'system'
] as const;
type KnowledgeSource = typeof VALID_SOURCES[number];

const STOPWORDS = new Set([
  'a','an','and','or','but','in','on','at','to','for','of','with','is','are',
  'was','were','be','been','being','have','has','had','do','does','did','will',
  'would','could','should','may','might','must','shall','can','this','that',
  'these','those','it','its','i','we','you','he','she','they','their','our',
  'your','my','his','her','not','no','by','as','if','so','up','from','into',
  'than','then','when','where','how','what','which','the','na','kwa','katika',
  'ni','wa','ya','nao','ndio','hadi','hata','la','cha','za'
]);

export interface CallerContext {
  userId: string;
  userEmail: string;
}

export interface PipelineInput {
  title: string;
  content: string;
  category?: string;
  status?: string;
  source?: string;
  reviewInterval?: number | null;
  lastReviewedAt?: Date | string | null;
  validFrom?: Date | string | null;
  validUntil?: Date | string | null;
  relationships?: string[] | null;
  tags?: any | null;
}

export interface DuplicateWarning {
  existingItemId: string;
  existingTitle: string;
  similarityScore: number;
}

export interface PipelineResult {
  success: boolean;
  duplicateWarning?: DuplicateWarning;
  error?: string;
}

// ─── Auto-Tag Generation Helper ──────────────────────────────────────────────

export function generateAutoTags(title: string, content: string): any {
  const text = `${title} ${content}`.toLowerCase();
  
  const topics: string[] = [];
  const entities: string[] = [];
  const services: string[] = [];
  const products: string[] = [];
  const industries: string[] = [];
  const technologies: string[] = [];
  const departments: string[] = [];

  if (/\b(pricing|cost|fee|price|budget|payment|invoice)\b/.test(text)) topics.push('Pricing');
  if (/\b(policy|sla|terms|license|agreement|compliant)\b/.test(text)) topics.push('Policy');
  if (/\b(process|deploy|setup|install|configure|guide|howto)\b/.test(text)) topics.push('Process');
  if (/\b(faq|question|answer|common|inquiry)\b/.test(text)) topics.push('FAQ');
  if (/\b(spec|technical|code|architecture|api|db)\b/.test(text)) topics.push('Technical Spec');

  if (/\b(denis|chamkaga)\b/.test(text)) entities.push('Denis Chamkaga');
  if (/\b(simuinvest)\b/.test(text)) entities.push('SimuInvest');
  if (/\b(terrasafi)\b/.test(text)) entities.push('Terrasafi');

  if (/\b(consulting|advice|guide)\b/.test(text)) services.push('Consulting');
  if (/\b(database|postgres|mysql|query|schema)\b/.test(text)) services.push('Database Design');
  if (/\b(pos|retail|sales|inventory|checkout)\b/.test(text)) services.push('POS Systems');
  if (/\b(crm|lead|client|customer)\b/.test(text)) services.push('CRM Implementation');
  if (/\b(automation|workflow|script|automatic)\b/.test(text)) services.push('Business Automation');

  if (/\b(pos)\b/.test(text)) products.push('POS Software');
  if (/\b(simuinvest)\b/.test(text)) products.push('SimuInvest Platform');
  if (/\b(terrasafi)\b/.test(text)) products.push('Terrasafi Recycling System');

  if (/\b(agribusiness|farm|agriculture|crop)\b/.test(text)) industries.push('Agribusiness');
  if (/\b(recycling|waste|ewaste|trash)\b/.test(text)) industries.push('Waste Management');
  if (/\b(retail|wholesale|shop|merchant)\b/.test(text)) industries.push('Retail & Distribution');

  if (/\b(postgres|postgresql)\b/.test(text)) technologies.push('PostgreSQL');
  if (/\b(mysql)\b/.test(text)) technologies.push('MySQL');
  if (/\b(react)\b/.test(text)) technologies.push('React');
  if (/\b(node|nodejs|express)\b/.test(text)) technologies.push('Node.js');
  if (/\b(docker)\b/.test(text)) technologies.push('Docker');
  if (/\b(typescript)\b/.test(text)) technologies.push('TypeScript');

  if (/\b(sales|billing|deal)\b/.test(text)) departments.push('Sales & Marketing');
  if (/\b(engineering|development|tech|dev)\b/.test(text)) departments.push('Engineering');
  if (/\b(legal|sla|compliance)\b/.test(text)) departments.push('Legal');
  if (/\b(ops|support|operations|tickets)\b/.test(text)) departments.push('Operations & Support');

  return {
    topics: topics.length > 0 ? topics : ['General'],
    entities,
    services,
    products,
    industries,
    technologies,
    departments
  };
}

// ─── Quality Score Calculator Helper ─────────────────────────────────────────

export function calculateQualityScore(item: {
  title: string;
  content: string;
  status: string;
  source: string;
  category: string;
  reviewInterval: number | null;
  validUntil: Date | null;
  relationships: any;
  tags: any;
}): number {
  let score = 0;

  if (item.status === 'published') score += 20;
  else if (item.status === 'review' || item.status === 'review_due') score += 15;
  else score += 10;

  if (item.category && item.category !== 'general') score += 5;
  if (item.source && item.source !== 'manual') score += 5;
  if (item.title.length > 10) score += 5;
  if (item.content.length > 200) score += 5;

  if (item.reviewInterval && item.reviewInterval > 0) score += 20;
  if (item.validUntil) score += 15;

  const relCount = Array.isArray(item.relationships) ? item.relationships.length : 0;
  if (relCount > 0) score += 15;

  if (item.tags && typeof item.tags === 'object') {
    let tagCount = 0;
    for (const key of Object.keys(item.tags)) {
      if (Array.isArray(item.tags[key]) && item.tags[key].length > 0) tagCount++;
    }
    if (tagCount >= 2) score += 10;
    else if (tagCount === 1) score += 5;
  }

  return Math.min(score, 100);
}

// ─── Stage 1: Validation ─────────────────────────────────────────────────────

function validate(input: PipelineInput): void {
  if (!input.title?.trim()) throw new Error('VALIDATION_ERROR: title is required');
  if (!input.content?.trim()) throw new Error('VALIDATION_ERROR: content is required');
  if (input.status && !VALID_STATUSES.includes(input.status as KnowledgeStatus)) {
    throw new Error(`VALIDATION_ERROR: invalid status "${input.status}". Valid: ${VALID_STATUSES.join(', ')}`);
  }
  if (input.source && !VALID_SOURCES.includes(input.source as KnowledgeSource)) {
    throw new Error(`VALIDATION_ERROR: invalid source "${input.source}". Valid: ${VALID_SOURCES.join(', ')}`);
  }
}

// ─── Stage 2: Normalization ───────────────────────────────────────────────────

function normalize(input: PipelineInput): PipelineInput {
  return {
    ...input,
    title: input.title.trim().replace(/\s+/g, ' '),
    content: input.content.trim().replace(/\s+/g, ' '),
    category: (input.category || 'general').trim().toLowerCase(),
    status: (input.status || 'published') as KnowledgeStatus,
    source: (input.source || 'manual') as KnowledgeSource,
  };
}

// ─── Stage 4: Keyword Extraction ─────────────────────────────────────────────

export function extractKeywords(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  const tokens = text
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
  return [...new Set(tokens)].slice(0, 30).join(', ');
}

// ─── Stage 5: Duplicate Detection (Jaccard similarity) ───────────────────────

function tokenSet(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
  return new Set(tokens);
}

export function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

async function detectDuplicate(
  title: string,
  content: string,
  excludeId?: string
): Promise<DuplicateWarning | undefined> {
  try {
    const existing = await prisma.aiKnowledgeItem.findMany({
      where: {
        status: 'published',
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: { id: true, title: true, content: true }
    });

    const candidateText = `${title} ${content}`;
    let topMatch: { id: string; title: string; score: number } | undefined;

    for (const item of existing) {
      const score = jaccardSimilarity(candidateText, `${item.title} ${item.content}`);
      if (score >= 0.75) {
        if (!topMatch || score > topMatch.score) {
          topMatch = { id: item.id, title: item.title, score };
        }
      }
    }

    if (topMatch) {
      return {
        existingItemId: topMatch.id,
        existingTitle: topMatch.title,
        similarityScore: Math.round(topMatch.score * 100) / 100
      };
    }
  } catch (err) {
    logger.warn('[Knowledge Pipeline] Duplicate detection failed (non-fatal):', err);
  }
  return undefined;
}

// ─── Audit log helper ─────────────────────────────────────────────────────────

async function writeAuditLog(action: string, description: string, performedBy: string): Promise<void> {
  try {
    await prisma.businessActivity.create({
      data: { action, description, performedBy }
    });
  } catch (err) {
    logger.warn('[Knowledge Pipeline] Audit log write failed (non-fatal):', err);
  }
}

// ─── Pipeline: CREATE ─────────────────────────────────────────────────────────

export async function processCreate(
  input: PipelineInput,
  ctx: CallerContext,
  skipDuplicateCheck = false
): Promise<{ item: any; result: PipelineResult }> {

  validate(input);
  const norm = normalize(input);
  const keywords = extractKeywords(norm.title, norm.content);

  let duplicateWarning: DuplicateWarning | undefined;
  if (!skipDuplicateCheck && norm.status === 'published') {
    duplicateWarning = await detectDuplicate(norm.title, norm.content);
    if (duplicateWarning) {
      aiEventBus.publish('KnowledgeDuplicateDetected', {
        newTitle: norm.title,
        existingItemId: duplicateWarning.existingItemId,
        similarityScore: duplicateWarning.similarityScore,
        createdBy: ctx.userEmail
      });
      return {
        item: null,
        result: { success: false, duplicateWarning }
      };
    }
  }

  // Auto-generate tags and calculate quality score
  const tags = input.tags || generateAutoTags(norm.title, norm.content);
  const relationships = input.relationships || [];
  
  const reviewInterval = norm.reviewInterval !== undefined && norm.reviewInterval !== null ? +norm.reviewInterval : null;
  const lastReviewedAt = norm.lastReviewedAt ? new Date(norm.lastReviewedAt) : null;
  const nextReviewAt = (reviewInterval && reviewInterval > 0)
    ? new Date((lastReviewedAt || new Date()).getTime() + reviewInterval * 24 * 60 * 60 * 1000)
    : null;

  const validFrom = norm.validFrom ? new Date(norm.validFrom) : null;
  const validUntil = norm.validUntil ? new Date(norm.validUntil) : null;

  const qualityScore = calculateQualityScore({
    title: norm.title,
    content: norm.content,
    status: norm.status!,
    source: norm.source!,
    category: norm.category!,
    reviewInterval,
    validUntil,
    relationships,
    tags
  });

  const isPublished = norm.status === 'published';
  const item = await prisma.aiKnowledgeItem.create({
    data: {
      title: norm.title,
      content: norm.content,
      category: norm.category!,
      status: norm.status!,
      source: norm.source!,
      keywords,
      version: 1,
      reviewInterval,
      lastReviewedAt,
      nextReviewAt,
      validFrom,
      validUntil,
      qualityScore,
      relationships: relationships as any,
      tags: tags as any,
      createdById: ctx.userId,
      createdByName: ctx.userEmail,
      updatedById: ctx.userId,
      updatedByName: ctx.userEmail,
      indexStatus: isPublished ? 'pending' : 'skipped'
    }
  });

  if (isPublished) {
    databaseKnowledgeProvider.clearCache();
    await prisma.aiKnowledgeItem.update({
      where: { id: item.id },
      data: { lastIndexedAt: new Date(), indexStatus: 'indexed' }
    });
  }

  aiEventBus.publish('KnowledgeCreated', {
    itemId: item.id,
    title: item.title,
    status: item.status,
    source: item.source,
    createdBy: ctx.userEmail
  });

  await writeAuditLog(
    'Knowledge Created',
    `Knowledge document "${item.title}" (source: ${item.source}, status: ${item.status}) created by ${ctx.userEmail} with Quality Score of ${qualityScore}%.`,
    ctx.userEmail
  );

  const fresh = await prisma.aiKnowledgeItem.findUnique({ where: { id: item.id } });
  return { item: fresh, result: { success: true } };
}

// ─── Pipeline: UPDATE ─────────────────────────────────────────────────────────

export async function processUpdate(
  id: string,
  input: Partial<PipelineInput>,
  ctx: CallerContext
): Promise<{ item: any; result: PipelineResult }> {

  const existing = await prisma.aiKnowledgeItem.findUniqueOrThrow({ where: { id } });
  const previousStatus = existing.status;

  if (input.status && !VALID_STATUSES.includes(input.status as KnowledgeStatus)) {
    throw new Error(`VALIDATION_ERROR: invalid status "${input.status}"`);
  }
  if (input.source && !VALID_SOURCES.includes(input.source as KnowledgeSource)) {
    throw new Error(`VALIDATION_ERROR: invalid source "${input.source}"`);
  }

  const newTitle = input.title !== undefined ? input.title.trim().replace(/\s+/g, ' ') : existing.title;
  const newContent = input.content !== undefined ? input.content.trim().replace(/\s+/g, ' ') : existing.content;
  const newStatus = (input.status || existing.status) as KnowledgeStatus;
  const newSource = (input.source || existing.source) as KnowledgeSource;
  const newCategory = input.category !== undefined ? input.category.trim().toLowerCase() : existing.category;

  const keywords = extractKeywords(newTitle, newContent);

  // Setup snapshots before updating
  await prisma.aiKnowledgeVersion.create({
    data: {
      knowledgeItemId: id,
      version: existing.version,
      title: existing.title,
      content: existing.content,
      keywords: existing.keywords,
      status: existing.status,
      changedById: ctx.userId,
      changedByName: ctx.userEmail,
      changedAt: new Date(),
      reviewInterval: existing.reviewInterval,
      lastReviewedAt: existing.lastReviewedAt,
      nextReviewAt: existing.nextReviewAt,
      validFrom: existing.validFrom,
      validUntil: existing.validUntil,
      qualityScore: existing.qualityScore,
      relationships: existing.relationships as any,
      tags: existing.tags as any
    }
  });

  const nextVersion = existing.version + 1;
  const isPublished = newStatus === 'published';

  // Manage scheduling calculations
  const reviewInterval = input.reviewInterval !== undefined 
    ? (input.reviewInterval !== null ? +input.reviewInterval : null)
    : existing.reviewInterval;

  const lastReviewedAt = input.lastReviewedAt !== undefined
    ? (input.lastReviewedAt ? new Date(input.lastReviewedAt) : null)
    : existing.lastReviewedAt;

  const nextReviewAt = (reviewInterval && reviewInterval > 0)
    ? new Date((lastReviewedAt || new Date()).getTime() + reviewInterval * 24 * 60 * 60 * 1000)
    : null;

  const validFrom = input.validFrom !== undefined
    ? (input.validFrom ? new Date(input.validFrom) : null)
    : existing.validFrom;

  const validUntil = input.validUntil !== undefined
    ? (input.validUntil ? new Date(input.validUntil) : null)
    : existing.validUntil;

  // Custom link updates
  const relationships = input.relationships !== undefined ? input.relationships : (existing.relationships as string[] || []);
  const tags = input.tags !== undefined ? input.tags : (existing.tags || generateAutoTags(newTitle, newContent));

  const qualityScore = calculateQualityScore({
    title: newTitle,
    content: newContent,
    status: newStatus,
    source: newSource,
    category: newCategory,
    reviewInterval,
    validUntil,
    relationships,
    tags
  });

  await prisma.aiKnowledgeItem.update({
    where: { id },
    data: {
      title: newTitle,
      content: newContent,
      category: newCategory,
      status: newStatus,
      source: newSource,
      keywords,
      version: nextVersion,
      reviewInterval,
      lastReviewedAt,
      nextReviewAt,
      validFrom,
      validUntil,
      qualityScore,
      relationships: relationships as any,
      tags: tags as any,
      updatedById: ctx.userId,
      updatedByName: ctx.userEmail,
      indexStatus: 'pending'
    }
  });

  databaseKnowledgeProvider.clearCache();
  await prisma.aiKnowledgeItem.update({
    where: { id },
    data: { lastIndexedAt: new Date(), indexStatus: isPublished ? 'indexed' : 'skipped' }
  });

  if (newStatus === 'archived' && previousStatus !== 'archived') {
    aiEventBus.publish('KnowledgeArchived', {
      itemId: id,
      title: newTitle,
      archivedBy: ctx.userEmail
    });
  } else {
    aiEventBus.publish('KnowledgeUpdated', {
      itemId: id,
      title: newTitle,
      previousStatus,
      newStatus,
      updatedBy: ctx.userEmail,
      version: nextVersion
    });
  }

  await writeAuditLog(
    'Knowledge Updated',
    `Knowledge document "${newTitle}" updated to v${nextVersion} (quality: ${qualityScore}%, status: ${newStatus}) by ${ctx.userEmail}.`,
    ctx.userEmail
  );

  const fresh = await prisma.aiKnowledgeItem.findUnique({ where: { id } });
  return { item: fresh, result: { success: true } };
}

// ─── Pipeline: DELETE ─────────────────────────────────────────────────────────

export async function processDelete(id: string, ctx: CallerContext): Promise<void> {
  const existing = await prisma.aiKnowledgeItem.findUniqueOrThrow({ where: { id } });
  await prisma.aiKnowledgeItem.delete({ where: { id } });
  databaseKnowledgeProvider.clearCache();

  aiEventBus.publish('KnowledgeArchived', {
    itemId: id,
    title: existing.title,
    archivedBy: ctx.userEmail
  });

  await writeAuditLog(
    'Knowledge Deleted',
    `Knowledge document "${existing.title}" permanently deleted by ${ctx.userEmail}.`,
    ctx.userEmail
  );
}

// ─── Pipeline: REINDEX ────────────────────────────────────────────────────────

export async function processReindex(ctx: CallerContext): Promise<number> {
  databaseKnowledgeProvider.clearCache();
  const now = new Date();
  const updated = await prisma.aiKnowledgeItem.updateMany({
    where: { status: 'published' },
    data: { lastIndexedAt: now, indexStatus: 'indexed' }
  });

  aiEventBus.publish('KnowledgeReindexed', {
    itemCount: updated.count,
    triggeredBy: ctx.userEmail
  });

  await writeAuditLog(
    'Knowledge Re-indexed',
    `Full BM25 re-index triggered by ${ctx.userEmail}. ${updated.count} published document(s) refreshed.`,
    ctx.userEmail
  );

  return updated.count;
}

// ─── Health Metrics ───────────────────────────────────────────────────────────

export async function getHealthMetrics() {
  const now = new Date();
  const [total, published, draft, archived, reviewDue, needsUpdate, indexed, failed, expired, items] = await Promise.all([
    prisma.aiKnowledgeItem.count(),
    prisma.aiKnowledgeItem.count({ where: { status: 'published' } }),
    prisma.aiKnowledgeItem.count({ where: { status: 'draft' } }),
    prisma.aiKnowledgeItem.count({ where: { status: 'archived' } }),
    prisma.aiKnowledgeItem.count({ 
      where: { 
        OR: [
          { status: 'needs_review' },
          { nextReviewAt: { lte: now } }
        ] 
      } 
    }),
    prisma.aiKnowledgeItem.count({ where: { status: 'needs_update' } }),
    prisma.aiKnowledgeItem.count({ where: { indexStatus: 'indexed' } }),
    prisma.aiKnowledgeItem.count({ where: { indexStatus: 'failed' } }),
    prisma.aiKnowledgeItem.count({ 
      where: { 
        validUntil: { lt: now } 
      } 
    }),
    prisma.aiKnowledgeItem.findMany({ select: { title: true, content: true } })
  ]);

  // Evaluate average quality score
  const aggQuality = await prisma.aiKnowledgeItem.aggregate({
    _avg: { qualityScore: true }
  });
  const avgQualityScore = Math.round(aggQuality._avg.qualityScore || 0);

  // Dynamic knowledge gap analyzer
  const text = items.map(i => `${i.title} ${i.content}`.toLowerCase()).join(' ');
  const suggestedGaps: string[] = [];
  
  if (!text.includes('refund') && !text.includes('cancel')) {
    suggestedGaps.push('Customer Refund & Cancellation Policy');
  }
  if (!text.includes('pricing') && !text.includes('cost')) {
    suggestedGaps.push('Detailed Services & Pricing Guide');
  }
  if (!text.includes('deployment') && !text.includes('setup')) {
    suggestedGaps.push('System Deployment & Setup Checklist');
  }
  if (!text.includes('support') && !text.includes('sla')) {
    suggestedGaps.push('SLA & Support Response Protocol');
  }
  if (suggestedGaps.length === 0) {
    suggestedGaps.push('Advanced Troubleshooting FAQ');
  }

  let duplicateCount = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const setA = new Set(`${items[i].title} ${items[i].content}`.toLowerCase().split(/\s+/));
      const setB = new Set(`${items[j].title} ${items[j].content}`.toLowerCase().split(/\s+/));
      let intersection = 0;
      for (const token of setA) {
        if (setB.has(token)) intersection++;
      }
      const union = setA.size + setB.size - intersection;
      const similarity = union === 0 ? 0 : intersection / union;
      if (similarity >= 0.75) {
        duplicateCount++;
      }
    }
  }

  return { 
    total, 
    published, 
    draft, 
    drafts: draft,
    archived, 
    reviewDue, 
    needsUpdate, 
    indexed, 
    failed,
    expired,
    avgQualityScore,
    suggestedGaps,
    indexHealth: failed > 0 ? 'Degraded' : 'Optimal',
    syncStats: { lastSync: now },
    duplicateCount
  };
}
