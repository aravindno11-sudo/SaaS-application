import express from 'express';
import { createWorkspace, getMyWorkspaces, addMember, deleteWorkspace } from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeWorkspace } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createWorkspace);
router.get('/', getMyWorkspaces);
router.post('/:id/members', authorizeWorkspace(['owner', 'admin']), addMember);
router.delete('/:id', authorizeWorkspace(['owner']), deleteWorkspace);

export default router;

