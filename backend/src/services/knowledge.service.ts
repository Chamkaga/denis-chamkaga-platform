import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { knowledgeEngine } from './knowledge.engine';
import { StorageProviderFactory } from '../providers/storage.factory';
import { LocalEventBus } from '../events/LocalEventBus';
import { createKnowledgeEvent } from '../events/knowledge.events';

export interface CreateKnowledgeInput {
  title: string;
  category: string;
  summary?: string;
  content: string;
  status?: 'draft' | 'published';
  tags?: string[];
  metadata?: Record<string, any>;
  authorId?: string;
}

export interface UpdateKnowledgeInput {
  title?: string;
  category?: string;
  summary?: string;
  content?: string;
  status?: 'draft' | 'published';
  tags?: string[];
  metadata?: Record<string, any>;
  changeSummary?: string;
  authorId?: string;
}

const eventBus = new LocalEventBus();

export function parseDocumentContent(buffer: Buffer, filename: string, mimeType: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (ext === 'txt' || ext === 'md' || mimeType.includes('text') || mimeType.includes('markdown')) {
    return buffer.toString('utf-8');
  }
  
  if (ext === 'docx' || mimeType.includes('officedocument')) {
    // Basic text extraction for DOCX XML blocks
    const str = buffer.toString('utf-8');
    const textMatches = str.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (textMatches && textMatches.length > 0) {
      return textMatches.map(t => t.replace(/<[^>]+>/g, '')).join(' ');
    }
    return buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  if (ext === 'pdf' || mimeType.includes('pdf')) {
    // Extract printable text from PDF buffer
    const raw = buffer.toString('utf-8');
    const textBlocks: string[] = [];
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match;
    while ((match = streamRegex.exec(raw)) !== null) {
      const cleaned = match[1].replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleaned.length > 5) textBlocks.push(cleaned);
    }
    if (textBlocks.length > 0) return textBlocks.join('\n');
    return raw.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return buffer.toString('utf-8');
}

export const knowledgeService = {
  async create(input: CreateKnowledgeInput) {
    const status = input.status || 'published';
    const item = await prisma.aiKnowledgeItem.create({
      data: {
        title: input.title,
        category: input.category,
        content: input.content,
        keywords: input.summary || input.tags?.join(', '),
        tags: input.tags || [],
        relationships: input.metadata || {},
        createdById: input.authorId,
        version: 1,
        status,
      },
    });

    // Create initial version history
    await prisma.aiKnowledgeVersion.create({
      data: {
        knowledgeItemId: item.id,
        version: 1,
        title: item.title,
        content: input.content,
        keywords: item.keywords,
        status,
        changedById: input.authorId,
      },
    });

    // Trigger chunking & embedding index automatically if published
    let dimensions = 1536;
    if (status === 'published') {
      const indexResult = await knowledgeEngine.indexKnowledgeItem(item.id);
      dimensions = indexResult.dimensions;
    }

    // Publish events
    eventBus.publish(
      createKnowledgeEvent('KnowledgeCreated', {
        knowledgeItemId: item.id,
        title: item.title,
        category: item.category,
        status,
        authorId: input.authorId,
      }, input.authorId)
    );

    eventBus.publish(
      createKnowledgeEvent('EmbeddingGenerated', {
        knowledgeItemId: item.id,
        dimensions,
        provider: 'OpenAI (Primary)',
      }, input.authorId)
    );

    return prisma.aiKnowledgeItem.findUnique({ where: { id: item.id } });
  },

  async update(id: string, input: UpdateKnowledgeInput) {
    const existing = await prisma.aiKnowledgeItem.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Knowledge item not found');

    const newVersion = existing.version + 1;
    const newContent = input.content || existing.content;
    const newKeywords = input.summary || input.tags?.join(', ') || existing.keywords;
    const newStatus = input.status || existing.status;

    const updated = await prisma.aiKnowledgeItem.update({
      where: { id },
      data: {
        title: input.title || existing.title,
        category: input.category || existing.category,
        content: newContent,
        keywords: newKeywords,
        status: newStatus,
        tags: input.tags || existing.tags || [],
        relationships: input.metadata
          ? ({ ...((existing.relationships as Record<string, any>) || {}), ...input.metadata })
          : (existing.relationships || {}),
        version: newVersion,
        updatedById: input.authorId,
      },
    });

    // Append to version history
    await prisma.aiKnowledgeVersion.create({
      data: {
        knowledgeItemId: id,
        version: newVersion,
        title: updated.title,
        content: newContent,
        keywords: newKeywords,
        status: updated.status,
        changedById: input.authorId,
      },
    });

    // Re-index if published
    if (newStatus === 'published') {
      await knowledgeEngine.indexKnowledgeItem(id);
    }

    eventBus.publish(
      createKnowledgeEvent('KnowledgeUpdated', {
        knowledgeItemId: id,
        version: newVersion,
        updatedFields: Object.keys(input),
      }, input.authorId)
    );

    return updated;
  },

  async delete(id: string) {
    const existing = await prisma.aiKnowledgeItem.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Knowledge item not found');

    await prisma.aiKnowledgeItem.delete({ where: { id } });

    eventBus.publish(
      createKnowledgeEvent('KnowledgeDeleted', { knowledgeItemId: id })
    );
  },

  async getById(id: string) {
    const item = await prisma.aiKnowledgeItem.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' } } },
    });
    if (!item) throw new AppError(404, 'NOT_FOUND', 'Knowledge item not found');
    return item;
  },

  async list(options?: { category?: string; tag?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.category) {
      where.category = options.category;
    }
    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { content: { contains: options.search, mode: 'insensitive' } },
        { keywords: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.aiKnowledgeItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.aiKnowledgeItem.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getCategories() {
    const categories = await prisma.aiKnowledgeItem.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    return categories.map(c => ({ name: c.category, count: c._count.category }));
  },

  async getTags() {
    const items = await prisma.aiKnowledgeItem.findMany({
      select: { tags: true },
    });
    const tagCountMap: Record<string, number> = {};
    for (const item of items) {
      if (Array.isArray(item.tags)) {
        for (const tag of item.tags) {
          const t = String(tag).trim();
          if (t) tagCountMap[t] = (tagCountMap[t] || 0) + 1;
        }
      }
    }
    return Object.entries(tagCountMap).map(([name, count]) => ({ name, count }));
  },

  async uploadAttachment(fileBuffer: Buffer, filename: string, mimeType: string, driver: 'cloudinary' | 's3' = 'cloudinary') {
    const parsedText = parseDocumentContent(fileBuffer, filename, mimeType);
    const storageProvider = StorageProviderFactory.getProvider(driver);
    const uploadResult = await storageProvider.uploadFile(fileBuffer, filename, mimeType);

    return {
      ...uploadResult,
      parsedContent: parsedText,
      originalName: filename,
      mimeType,
      sizeBytes: fileBuffer.length,
      driver,
    };
  },

  async getDownloadUrl(key: string, driver: 'cloudinary' | 's3' = 'cloudinary') {
    const storageProvider = StorageProviderFactory.getProvider(driver);
    return storageProvider.getSignedUrl(key);
  },

  async deleteAttachment(key: string, driver: 'cloudinary' | 's3' = 'cloudinary') {
    const storageProvider = StorageProviderFactory.getProvider(driver);
    return storageProvider.deleteFile(key);
  },

  async reindexAll() {
    const startTime = Date.now();
    const items = await prisma.aiKnowledgeItem.findMany({ where: { status: 'published' } });
    let count = 0;

    for (const item of items) {
      await knowledgeEngine.indexKnowledgeItem(item.id);
      count++;
    }

    const durationMs = Date.now() - startTime;

    eventBus.publish(
      createKnowledgeEvent('IndexCompleted', {
        totalItemsIndexed: count,
        durationMs,
      })
    );

    return { totalIndexed: count, durationMs };
  },
};
