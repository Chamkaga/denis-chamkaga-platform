import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { knowledgeService } from '../services/knowledge.service';
import { knowledgeEngine } from '../services/knowledge.engine';
import { ApiResponse } from '../types/api';

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  summary: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateSchema = createSchema.partial().extend({
  changeSummary: z.string().optional(),
});

export const knowledgeController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const page = req.query.page ? parseInt(String(req.query.page)) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 20;

      const result = await knowledgeService.list({ category, tag, status, search, page, limit });
      res.status(200).json({ success: true, data: result.items, meta: result.pagination } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await knowledgeService.getCategories();
      res.status(200).json({ success: true, data: categories } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async getTags(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await knowledgeService.getTags();
      res.status(200).json({ success: true, data: tags } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await knowledgeService.getById(id);
      res.status(200).json({ success: true, data: item } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createSchema.parse(req.body);
      const item = await knowledgeService.create({ ...input, authorId: req.user?.id });
      res.status(201).json({ success: true, data: item } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const input = updateSchema.parse(req.body);
      const item = await knowledgeService.update(id, { ...input, authorId: req.user?.id });
      res.status(200).json({ success: true, data: item } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await knowledgeService.delete(id);
      res.status(200).json({ success: true, data: { message: 'Knowledge item deleted successfully' } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async hybridSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryStr = typeof req.query.query === 'string' ? req.query.query : '';
      const categoryStr = typeof req.query.category === 'string' ? req.query.category : undefined;
      const limitNum = req.query.limit ? parseInt(String(req.query.limit)) : 5;

      const results = await knowledgeEngine.hybridSearch(queryStr, { category: categoryStr, limit: limitNum });
      res.status(200).json({ success: true, data: results } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async assembleContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryStr = typeof req.query.query === 'string' ? req.query.query : '';
      const categoryStr = typeof req.query.category === 'string' ? req.query.category : undefined;
      const limitNum = req.query.limit ? parseInt(String(req.query.limit)) : 5;

      const contextPrompt = await knowledgeEngine.assembleContext(queryStr, { category: categoryStr, limit: limitNum });
      res.status(200).json({ success: true, data: { query: queryStr, context: contextPrompt } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async reindexAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await knowledgeService.reindexAll();
      res.status(200).json({ success: true, data: result } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No document file uploaded' } });
        return;
      }
      const driver = (req.body.driver as 'cloudinary' | 's3') || 'cloudinary';
      const result = await knowledgeService.uploadAttachment(file.buffer, file.originalname, file.mimetype, driver);
      res.status(200).json({ success: true, data: result } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async downloadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = String(req.query.key || req.params.key);
      const driver = (req.query.driver as 'cloudinary' | 's3') || 'cloudinary';
      const result = await knowledgeService.getDownloadUrl(key, driver);
      res.status(200).json({ success: true, data: result } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async deleteAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = String(req.query.key || req.params.key);
      const driver = (req.query.driver as 'cloudinary' | 's3') || 'cloudinary';
      const result = await knowledgeService.deleteAttachment(key, driver);
      res.status(200).json({ success: true, data: result } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },
};
