// src/ai/knowledge-engine.ts
// Knowledge Engine coordinating queries across registered providers with deterministic precedence, audience isolation, and structured trace observability.

import { 
  KNOWLEDGE_PROVIDERS_REGISTRY, 
  KnowledgeDocument, 
  RetrievalContext,
  KnowledgeAudience 
} from './providers/knowledge.provider';
import './providers/database-knowledge.provider'; // Ensure providers are loaded & registered
import './providers/static-knowledge.provider';
import './services/knowledge-automation.engine';  // Bootstrap automation event subscribers
import { logger } from '../utils/logger';

export { KnowledgeDocument, RetrievalContext, KnowledgeAudience };

export interface KnowledgeTraceEntry {
  traceId: string;
  query: string;
  audience: KnowledgeAudience;
  candidateDocsCount: number;
  selectedDocs: {
    id: string;
    source: string;
    sourceType: string;
    sourceOfTruth: string;
    version: string;
    audience: string;
    title: string;
  }[];
  timestamp: string;
}

export interface KnowledgeRetrievalResult {
  documents: KnowledgeDocument[];
  confidenceScore: number; // 0 - 100%
  confidenceLevel: 'High' | 'Medium' | 'Low';
  confidenceBreakdown: {
    retrievalScore: number; // 35% weight
    sourceQualityScore: number; // 25% weight
    freshnessScore: number; // 20% weight
    coverageScore: number; // 10% weight
    consensusScore: number; // 10% weight
  };
  sourcesCited: { title: string; domain: string; source: string; sourceOfTruth: string; version: string }[];
  requiresHumanFallback: boolean;
  trace: KnowledgeTraceEntry;
}

export const aiKnowledgeEngine = {
  /**
   * Retrieves matching documents across all registered knowledge providers with audience scoping.
   */
  async retrieve(query: string, limit = 3, context?: RetrievalContext): Promise<KnowledgeDocument[]> {
    const res = await this.retrieveWithConfidence(query, limit, context);
    return res.documents;
  },

  /**
   * Enterprise Retrieval with Deterministic Precedence, Audience Isolation, and Structured RAG Observability.
   */
  async retrieveWithConfidence(
    query: string, 
    limit = 3, 
    context?: RetrievalContext
  ): Promise<KnowledgeRetrievalResult> {
    const traceId = context?.traceId || `rag_trace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const targetAudience = context?.audience || (context?.userRole === 'admin' || context?.userRole === 'super_admin' ? 'ADMIN' : 'MARY');

    const activeProviders = Object.values(KNOWLEDGE_PROVIDERS_REGISTRY)
      .filter(p => p.isEnabled())
      .sort((a, b) => (a.precedence || 3) - (b.precedence || 3)); // Precedence 1 (Database) > Precedence 2 (Static)

    logger.info(`[Knowledge Engine Trace: ${traceId}] Query: "${query.substring(0, 40)}" | Audience: ${targetAudience} | Providers: ${activeProviders.map(p => p.name).join(', ')}`);

    const providerResults: { providerName: string; precedence: number; docs: KnowledgeDocument[] }[] = [];

    await Promise.all(activeProviders.map(async (provider) => {
      try {
        const results = await provider.retrieve(query, limit * 2, { ...context, audience: targetAudience, traceId });
        providerResults.push({
          providerName: provider.name,
          precedence: provider.precedence || 3,
          docs: results
        });
        logger.info(`[Knowledge Engine Trace: ${traceId}] Provider "${provider.name}" (Precedence: ${provider.precedence}) returned ${results.length} docs`);
      } catch (err) {
        logger.error(`[Knowledge Engine Trace: ${traceId}] Provider "${provider.name}" failed:`, err);
      }
    }));

    // Collect all candidate documents across providers
    const candidateDocs: { doc: KnowledgeDocument; score: number; precedence: number }[] = [];

    for (const batch of providerResults) {
      for (const doc of batch.docs) {
        // Enforce lifecycle status = ACTIVE and audience isolation
        if (doc.status !== 'ACTIVE') continue;
        if (doc.audience !== 'BOTH' && doc.audience !== targetAudience) continue;

        const docScore = (doc as any).score !== undefined ? (doc as any).score : 0.5;
        candidateDocs.push({ 
          doc, 
          score: docScore, 
          precedence: batch.precedence 
        });
      }
    }

    // Sort all candidates primarily by score descending, secondarily by precedence ascending (1 > 2)
    candidateDocs.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) > 0.001) {
        return scoreDiff;
      }
      return a.precedence - b.precedence;
    });

    // Deduplicate based on document ID
    const uniqueDocsMap = new Map<string, KnowledgeDocument>();
    for (const item of candidateDocs) {
      if (!uniqueDocsMap.has(item.doc.id)) {
        uniqueDocsMap.set(item.doc.id, item.doc);
      }
    }

    const uniqueDocs = Array.from(uniqueDocsMap.values());
    const topDocs = uniqueDocs.slice(0, limit);

    // 5-Factor Weighted Confidence Formula
    let rawRetrieval = 0.65;
    if (topDocs.length > 0) {
      rawRetrieval = (topDocs[0] as any).score || 0.85;
    }

    const retrievalScore = Math.min(100, Math.round(rawRetrieval * 100)); // 35%
    const sourceQualityScore = topDocs.length > 0 ? (topDocs[0].qualityScore || 95) : 40; // 25%
    const freshnessScore = 90; // 20%
    const coverageScore = topDocs.length >= limit ? 90 : (topDocs.length * 30); // 10%
    const consensusScore = topDocs.length >= 2 ? 85 : 50; // 10%

    const weightedScore = Math.round(
      (0.35 * retrievalScore) +
      (0.25 * sourceQualityScore) +
      (0.20 * freshnessScore) +
      (0.10 * coverageScore) +
      (0.10 * consensusScore)
    );

    const confidenceScore = topDocs.length === 0 ? 30 : Math.min(98, weightedScore);

    let confidenceLevel: 'High' | 'Medium' | 'Low' = 'High';
    let requiresHumanFallback = false;

    if (confidenceScore < 70) {
      confidenceLevel = 'Low';
      requiresHumanFallback = true;
    } else if (confidenceScore < 85) {
      confidenceLevel = 'Medium';
    }

    const sourcesCited = topDocs.map(d => ({
      title: d.title,
      domain: d.domain || (d as any).category || 'General',
      source: d.source || 'KnowledgeBase',
      sourceOfTruth: d.sourceOfTruth || 'Unknown',
      version: d.version || '1.0.0'
    }));

    const trace: KnowledgeTraceEntry = {
      traceId,
      query,
      audience: targetAudience,
      candidateDocsCount: candidateDocs.length,
      selectedDocs: topDocs.map(d => ({
        id: d.id,
        source: d.source,
        sourceType: d.sourceType,
        sourceOfTruth: d.sourceOfTruth,
        version: d.version,
        audience: d.audience,
        title: d.title
      })),
      timestamp: new Date().toISOString()
    };

    logger.info(`[Knowledge Engine Trace: ${traceId}] Selected ${topDocs.length} docs (Confidence: ${confidenceScore}% / ${confidenceLevel}) | Sources: [${topDocs.map(d => d.id).join(', ')}]`);

    return {
      documents: topDocs,
      confidenceScore,
      confidenceLevel,
      confidenceBreakdown: {
        retrievalScore,
        sourceQualityScore,
        freshnessScore,
        coverageScore,
        consensusScore
      },
      sourcesCited,
      requiresHumanFallback,
      trace
    };
  }
};
