import express from 'express';
import { createDocument, getWorkspaceDocuments, getDocumentById, updateDocument, deleteDocument, exportDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeWorkspace } from '../middleware/rbacMiddleware.js';
import { checkDocumentLimit } from '../middleware/planMiddleware.js';
const router = express.Router();
router.use(protect);
router.post('/', checkDocumentLimit, createDocument);
router.get('/workspace/:workspaceId', getWorkspaceDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/export', exportDocument);
router.put('/:id', updateDocument);
router.delete('/:id', authorizeWorkspace(['owner', 'admin']), deleteDocument);
export default router;
//# sourceMappingURL=documentRoutes.js.map