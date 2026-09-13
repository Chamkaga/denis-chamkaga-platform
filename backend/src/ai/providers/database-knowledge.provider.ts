// src/ai/providers/database-knowledge.provider.ts
// Dynamic database knowledge provider indexing services, projects, FAQs, and custom AI knowledge items.

import { KnowledgeProvider, KnowledgeDocument, registerKnowledgeProvider } from './knowledge.provider';
import { publicService } from '../../services/public.service';
import { BM25 } from '../utils/bm25';
import { logger } from '../../utils/logger';
import prisma from '../../config/database';

let cache: KnowledgeDocument[] | null = null;
let cacheTime = 0;
const TTL = 10 * 60 * 1000; // 10 minutes cache

class DatabaseKnowledgeProvider implements KnowledgeProvider {
  name = 'database';
  precedence = 1; // Precedence 1 (Live DB CMS Entities)

  isEnabled(): boolean {
    return process.env.AI_KNOWLEDGE_ENGINE !== 'false';
  }

  public invalidateCache(): void {
    logger.info('[AI DB Knowledge Provider] Invalidating cache for re-indexing...');
    cache = null;
    cacheTime = 0;
  }

  public clearCache(): void {
    this.invalidateCache();
  }

  private async buildCache(): Promise<KnowledgeDocument[]> {
    const now = Date.now();
    if (cache && now - cacheTime < TTL) {
      return cache;
    }

    try {
      logger.info('[AI DB Knowledge Provider] Reloading documents cache...');
      
      const nowDb = new Date();
      const [services, projectsResult, faqs, customItems] = await Promise.all([
        publicService.getServices(),
        publicService.getProjects({ limit: 30 }),
        publicService.getFaqs(),
        prisma.aiKnowledgeItem.findMany({ 
          where: { 
            status: 'published',
            AND: [
              {
                OR: [
                  { validFrom: null },
                  { validFrom: { lte: nowDb } }
                ]
              },
              {
                OR: [
                  { validUntil: null },
                  { validUntil: { gte: nowDb } }
                ]
              }
            ]
          } 
        })
      ]);

      const documents: KnowledgeDocument[] = [];

      // 1. Map services
      for (const s of services) {
        documents.push({
          id: `db.service.${s.id}`,
          source: 'service',
          sourceType: 'DATABASE',
          sourceId: s.id,
          sourceOfTruth: `database:Service:${s.id}`,
          title: `Service: ${s.title}`,
          content: `${s.title}: ${s.description}. Features: ${Array.isArray(s.features) ? s.features.join(', ') : ''}. Technologies: ${Array.isArray(s.technologies) ? s.technologies.join(', ') : ''}`,
          audience: 'BOTH',
          status: 'ACTIVE',
          version: '1.0.0',
          qualityScore: 100,
          relationships: []
        });
      }

      // 2. Map projects
      if (projectsResult && Array.isArray(projectsResult.items)) {
        for (const p of projectsResult.items) {
          documents.push({
            id: `db.project.${p.id}`,
            source: 'project',
            sourceType: 'DATABASE',
            sourceId: p.id,
            sourceOfTruth: `database:Project:${p.id}`,
            title: `Project Case: ${p.title}`,
            content: `${p.title} (${p.status}): ${p.description}. Category: ${p.category}. Tech stack: ${Array.isArray(p.techStack) ? p.techStack.join(', ') : ''}`,
            audience: 'BOTH',
            status: 'ACTIVE',
            version: '1.0.0',
            qualityScore: 100,
            relationships: []
          });
        }
      }

      // 3. Map FAQs
      for (const f of faqs) {
        documents.push({
          id: `db.faq.${f.id}`,
          source: 'faq',
          sourceType: 'DATABASE',
          sourceId: f.id,
          sourceOfTruth: `database:Faq:${f.id}`,
          title: `FAQ: ${f.question}`,
          content: `Question: ${f.question}\nAnswer: ${f.answer}`,
          audience: 'BOTH',
          status: 'ACTIVE',
          version: '1.0.0',
          qualityScore: 100,
          relationships: []
        });
      }

      // 4. Map Custom AI Knowledge Items
      for (const item of customItems) {
        const enrichedContent = item.keywords
          ? `${item.content}\n\nKeywords: ${item.keywords}`
          : item.content;
        documents.push({
          id: `db.ai_knowledge.${item.id}`,
          source: 'ai_knowledge',
          sourceType: 'DATABASE',
          sourceId: item.id,
          sourceOfTruth: `database:AiKnowledgeItem:${item.id}`,
          title: item.title,
          content: enrichedContent,
          audience: 'BOTH',
          status: 'ACTIVE',
          version: '1.0.0',
          qualityScore: item.qualityScore || 100,
          relationships: Array.isArray(item.relationships) ? (item.relationships as string[]) : [],
          expiresAt: item.validUntil ? item.validUntil.toISOString() : undefined
        });
      }

      cache = documents;
      cacheTime = now;
      return documents;
    } catch (err) {
      logger.error('[AI DB Knowledge Provider] Failed building cache:', err);
      return [];
    }
  }

  async retrieve(query: string, limit: number, context?: any): Promise<KnowledgeDocument[]> {
    const docs = await this.buildCache();
    if (docs.length === 0) return [];

    const targetAudience = context?.audience;

    // Filter out expired items dynamically and match audience
    const now = Date.now();
    const activeDocs = docs.filter((d: any) => {
      if (d.status !== 'ACTIVE') return false;
      if (d.expiresAt && new Date(d.expiresAt).getTime() < now) {
        return false;
      }
      if (targetAudience && d.audience !== 'BOTH' && d.audience !== targetAudience) {
        return false;
      }
      return true;
    });

    if (activeDocs.length === 0) return [];

    const corpus = activeDocs.map(d => `${d.title} ${d.content}`);
    const bm25 = new BM25(corpus);
    const scores = bm25.search(query);

    // Compute composite rank scores
    const scored = activeDocs.map((d: any, idx) => {
      const bm25Score = scores[idx] || 0;
      
      const qScore = d.qualityScore !== undefined ? d.qualityScore : 100;
      const qualityBoost = 1.0 + (qScore / 200.0); // Up to +50% boost for 100% quality

      const compositeScore = bm25Score * qualityBoost;

      return { doc: d, score: compositeScore, originalScore: bm25Score };
    })
    .filter(item => item.originalScore > 0.001)
    .sort((a, b) => b.score - a.score);

    // Get primary docs matching limit
    const primaryDocs = scored.slice(0, limit).map(item => ({
      ...item.doc,
      score: item.score
    }));

    // Resolve relationships: Recursively fetch and append context of related Linked Documents
    const finalDocs: KnowledgeDocument[] = [...primaryDocs];
    const seenIds = new Set(primaryDocs.map(d => d.id));

    for (const doc of primaryDocs) {
      const rawDoc = doc as any;
      if (Array.isArray(rawDoc.relationships) && rawDoc.relationships.length > 0) {
        for (const relId of rawDoc.relationships) {
          const targetId = `db.ai_knowledge.${relId}`;
          if (!seenIds.has(targetId)) {
            const relDoc = docs.find(d => d.id === targetId);
            if (relDoc) {
              seenIds.add(targetId);
              finalDocs.push(relDoc);
            }
          }
        }
      }
    }

    return finalDocs;
  }
}

// Automatically register provider
export const databaseKnowledgeProvider = new DatabaseKnowledgeProvider();
registerKnowledgeProvider(databaseKnowledgeProvider);
export default databaseKnowledgeProvider;
