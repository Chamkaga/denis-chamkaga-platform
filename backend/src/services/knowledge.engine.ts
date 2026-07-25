import { AIProviderFactory } from '../providers/ai.factory';
import prisma from '../config/database';

export interface Chunk {
  index: number;
  text: string;
  embedding: number[];
}

export interface SearchResult {
  itemId: string;
  title: string;
  category: string;
  content: string;
  chunkText: string;
  score: number;
  similarityScore?: number;
  keywordScore?: number;
  metadata?: Record<string, any>;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const knowledgeEngine = {
  // ── Chunking Engine ──────────────────────────────────────────────────────────
  chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
    if (!text || text.length === 0) return [];
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.slice(start, end));
      if (end === text.length) break;
      start += chunkSize - overlap;
    }
    return chunks;
  },

  // ── Document Reconstruction ──────────────────────────────────────────────────
  reconstructDocument(chunks: string[], overlap = 100): string {
    if (!chunks || chunks.length === 0) return '';
    let reconstructed = chunks[0];
    for (let i = 1; i < chunks.length; i++) {
      const current = chunks[i];
      if (reconstructed.endsWith(current.slice(0, overlap))) {
        reconstructed += current.slice(overlap);
      } else {
        let bestOverlap = 0;
        for (let len = Math.min(overlap * 2, reconstructed.length, current.length); len > 0; len--) {
          if (reconstructed.endsWith(current.slice(0, len))) {
            bestOverlap = len;
            break;
          }
        }
        reconstructed += current.slice(bestOverlap);
      }
    }
    return reconstructed;
  },

  // ── Embedding Generation ─────────────────────────────────────────────────────
  async generateEmbedding(text: string): Promise<number[]> {
    const aiProvider = AIProviderFactory.getProvider();
    const result = await aiProvider.generateEmbeddings(text);
    return result.embeddings;
  },

  // ── Chunk & Embed Knowledge Item ─────────────────────────────────────────────
  async indexKnowledgeItem(itemId: string): Promise<{ totalChunks: number; dimensions: number }> {
    const item = await prisma.aiKnowledgeItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error(`Knowledge item ${itemId} not found`);

    const rawChunks = this.chunkText(item.content);
    const chunksWithEmbeddings: Chunk[] = [];

    for (let i = 0; i < rawChunks.length; i++) {
      const text = rawChunks[i];
      const embedding = await this.generateEmbedding(text);
      chunksWithEmbeddings.push({ index: i, text, embedding });
    }

    const dimensions = chunksWithEmbeddings[0]?.embedding.length || 0;
    const existingRel = (item.relationships as Record<string, any>) || {};

    await prisma.aiKnowledgeItem.update({
      where: { id: itemId },
      data: {
        lastIndexedAt: new Date(),
        indexStatus: 'completed',
        relationships: {
          ...existingRel,
          chunks: chunksWithEmbeddings.map((c) => ({ index: c.index, text: c.text })),
          embeddings: chunksWithEmbeddings.map((c) => c.embedding),
          dimensions,
        },
      },
    });

    return { totalChunks: rawChunks.length, dimensions };
  },

  // ── Hybrid Search (Semantic Vector + Full-text Keyword Match) ─────────────────
  async hybridSearch(query: string, options?: { limit?: number; category?: string }): Promise<SearchResult[]> {
    const limit = options?.limit || 5;
    const queryEmbedding = await this.generateEmbedding(query);
    const queryKeywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    const items = await prisma.aiKnowledgeItem.findMany({
      where: {
        status: 'published',
        ...(options?.category ? { category: options.category } : {}),
      },
    });

    const results: SearchResult[] = [];

    for (const item of items) {
      const rel = (item.relationships as Record<string, any>) || {};
      const chunks = (rel.chunks as Array<{ index: number; text: string }>) || [];
      const embeddings = (rel.embeddings as Array<number[]>) || [];

      if (chunks.length === 0) {
        const fullText = `${item.title} ${item.keywords || ''} ${item.content}`.toLowerCase();
        let kwMatches = 0;
        for (const kw of queryKeywords) {
          if (fullText.includes(kw)) kwMatches++;
        }
        const kwScore = queryKeywords.length > 0 ? kwMatches / queryKeywords.length : 0;
        if (kwScore > 0) {
          results.push({
            itemId: item.id,
            title: item.title,
            category: item.category,
            content: item.content,
            chunkText: item.content.substring(0, 200),
            score: kwScore * 0.5,
          });
        }
        continue;
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const emb = embeddings[i];

        const rawSim = emb ? cosineSimilarity(queryEmbedding, emb) : 0;
        const vectorScore = Math.max(0, (rawSim + 1) / 2);

        const chunkTextLower = chunk.text.toLowerCase();
        let kwMatches = 0;
        for (const kw of queryKeywords) {
          if (chunkTextLower.includes(kw)) kwMatches++;
        }
        const kwScore = queryKeywords.length > 0 ? kwMatches / queryKeywords.length : 0;

        const hybridScore = vectorScore * 0.7 + kwScore * 0.3;

        results.push({
          itemId: item.id,
          title: item.title,
          category: item.category,
          content: item.content,
          chunkText: chunk.text,
          score: hybridScore,
          similarityScore: vectorScore,
          keywordScore: kwScore,
          metadata: rel,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  },

  // ── Context Assembly for AI Copilot / AI Assistant ───────────────────────────
  async assembleContext(query: string, options?: { limit?: number; category?: string; maxTokens?: number }): Promise<string> {
    const results = await this.hybridSearch(query, options);
    if (results.length === 0) return 'No relevant knowledge base context found.';

    const maxTokenBudget = options?.maxTokens || 1500;
    const maxCharBudget = maxTokenBudget * 4; // Approx 4 chars per token

    const seenChunkTexts = new Set<string>();
    const deduplicatedResults: SearchResult[] = [];

    for (const r of results) {
      const normalized = r.chunkText.trim().toLowerCase();
      if (!seenChunkTexts.has(normalized)) {
        seenChunkTexts.add(normalized);
        deduplicatedResults.push(r);
      }
    }

    const contextBlocks: string[] = [];
    let currentLength = 0;

    for (let idx = 0; idx < deduplicatedResults.length; idx++) {
      const r = deduplicatedResults[idx];
      const block = `[Context Item #${idx + 1} - "${r.title}" (Category: ${r.category}, Relevance: ${(r.score * 100).toFixed(1)}%)]\n${r.chunkText}`;
      if (currentLength + block.length > maxCharBudget && contextBlocks.length > 0) {
        break; // Token budget cap reached deterministically
      }
      contextBlocks.push(block);
      currentLength += block.length;
    }

    return contextBlocks.join('\n\n---\n\n');
  },
};
