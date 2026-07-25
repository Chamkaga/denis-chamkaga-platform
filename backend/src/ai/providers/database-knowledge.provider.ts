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

  isEnabled(): boolean {
    return process.env.AI_KNOWLEDGE_ENGINE !== 'false';
  }

  public clearCache(): void {
    logger.info('[AI DB Knowledge Provider] Invalidating cache for re-indexing...');
    cache = null;
    cacheTime = 0;
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
          id: `db_service_${s.id}`,
          source: 'service',
          title: `Service: ${s.title}`,
          content: `${s.title}: ${s.description}. Features: ${Array.isArray(s.features) ? s.features.join(', ') : ''}. Technologies: ${Array.isArray(s.technologies) ? s.technologies.join(', ') : ''}`,
          qualityScore: 100,
          relationships: []
        } as any);
      }

      // 2. Map projects
      if (projectsResult && Array.isArray(projectsResult.items)) {
        for (const p of projectsResult.items) {
          documents.push({
            id: `db_project_${p.id}`,
            source: 'project',
            title: `Project Case: ${p.title}`,
            content: `${p.title} (${p.status}): ${p.description}. Category: ${p.category}. Tech stack: ${Array.isArray(p.techStack) ? p.techStack.join(', ') : ''}`,
            qualityScore: 100,
            relationships: []
          } as any);
        }
      }

      // 3. Map FAQs
      for (const f of faqs) {
        documents.push({
          id: `db_faq_${f.id}`,
          source: 'faq',
          title: `FAQ: ${f.question}`,
          content: `Question: ${f.question}\nAnswer: ${f.answer}`,
          qualityScore: 100,
          relationships: []
        } as any);
      }

      // 4. Map Custom AI Knowledge Items
      for (const item of customItems) {
        const enrichedContent = item.keywords
          ? `${item.content}\n\nKeywords: ${item.keywords}`
          : item.content;
        documents.push({
          id: `db_ai_knowledge_${item.id}`,
          source: 'ai_knowledge',
          title: item.title,
          content: enrichedContent,
          qualityScore: item.qualityScore,
          updatedAt: item.updatedAt,
          relationships: Array.isArray(item.relationships) ? (item.relationships as string[]) : [],
          validUntil: item.validUntil
        } as any);
      }

      cache = documents;
      cacheTime = now;
      return documents;
    } catch (err) {
      logger.error('[AI DB Knowledge Provider] Failed building cache:', err);
      return [];
    }
  }

  async retrieve(query: string, limit: number): Promise<KnowledgeDocument[]> {
    const docs = await this.buildCache();
    if (docs.length === 0) return [];

    // Filter out expired items dynamically
    const now = Date.now();
    const activeDocs = docs.filter((d: any) => {
      if (d.validUntil && new Date(d.validUntil).getTime() < now) {
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
      
      const ageInDays = d.updatedAt
        ? Math.max(0, (now - new Date(d.updatedAt).getTime()) / (24 * 60 * 60 * 1000))
        : 30;
      const freshnessBoost = ageInDays < 7 ? 1.25 : (ageInDays < 30 ? 1.1 : 1.0); // up to +25% boost if updated in last 7 days

      const compositeScore = bm25Score * qualityBoost * freshnessBoost;

      return { doc: d, score: compositeScore, originalScore: bm25Score };
    })
    .filter(item => item.originalScore > 0.001)
    .sort((a, b) => b.score - a.score);

    // Get primary docs matching limit
    const primaryDocs = scored.slice(0, limit).map(item => item.doc);

    // Resolve relationships: Recursively fetch and append context of related Linked Documents
    const finalDocs: KnowledgeDocument[] = [...primaryDocs];
    const seenIds = new Set(primaryDocs.map(d => d.id));

    for (const doc of primaryDocs) {
      const rawDoc = doc as any;
      if (Array.isArray(rawDoc.relationships) && rawDoc.relationships.length > 0) {
        for (const relId of rawDoc.relationships) {
          const targetId = `db_ai_knowledge_${relId}`;
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
