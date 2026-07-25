import { Router } from 'express';
import multer from 'multer';
import { knowledgeController } from '../controllers/knowledge.controller';
import { requireAuth, requirePermission } from '../middleware/auth.middleware';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

// Public & Assistant Retrieval routes
router.get('/search', knowledgeController.hybridSearch);
router.get('/context', knowledgeController.assembleContext);
router.get('/categories', knowledgeController.getCategories);
router.get('/tags', knowledgeController.getTags);
router.get('/download', knowledgeController.downloadDocument);

// Protected Admin Management routes
router.get('/', requireAuth, knowledgeController.list);
router.get('/:id', requireAuth, knowledgeController.getById);
router.post('/', requireAuth, requirePermission('ai', 'create'), knowledgeController.create);
router.put('/:id', requireAuth, requirePermission('ai', 'update'), knowledgeController.update);
router.delete('/:id', requireAuth, requirePermission('ai', 'delete'), knowledgeController.delete);
router.post('/reindex', requireAuth, requirePermission('ai', 'update'), knowledgeController.reindexAll);
router.post('/upload', requireAuth, requirePermission('ai', 'create'), upload.single('file'), knowledgeController.uploadDocument);
router.delete('/upload/file', requireAuth, requirePermission('ai', 'delete'), knowledgeController.deleteAttachment);

export default router;
