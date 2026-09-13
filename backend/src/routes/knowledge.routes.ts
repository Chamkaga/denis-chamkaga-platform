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

// Protected Admin Management static routes (MUST come before /:id)
router.get('/', requireAuth, knowledgeController.list);
router.get('/diagnostics', requireAuth, knowledgeController.getDiagnostics);
router.post('/test-retrieval', requireAuth, knowledgeController.testRetrieval);
router.get('/test-retrieval', requireAuth, knowledgeController.testRetrieval);
router.post('/reindex', requireAuth, knowledgeController.reindexAll);
router.post('/upload', requireAuth, requirePermission('ai', 'create'), upload.single('file'), knowledgeController.uploadDocument);
router.delete('/upload/file', requireAuth, requirePermission('ai', 'delete'), knowledgeController.deleteAttachment);

// Parameter routes
router.get('/:id', requireAuth, knowledgeController.getById);
router.post('/', requireAuth, requirePermission('ai', 'create'), knowledgeController.create);
router.put('/:id', requireAuth, requirePermission('ai', 'update'), knowledgeController.update);
router.delete('/:id', requireAuth, requirePermission('ai', 'delete'), knowledgeController.delete);

export default router;
