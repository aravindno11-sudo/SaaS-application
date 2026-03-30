import express from 'express';
import { getWorkspaceActivity, getWorkspaceStats } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeWorkspace } from '../middleware/rbacMiddleware.js';
const router = express.Router();
router.get('/:workspaceId', protect, authorizeWorkspace(['owner', 'admin', 'member']), getWorkspaceActivity);
router.get('/:workspaceId/stats', protect, authorizeWorkspace(['owner', 'admin', 'member']), getWorkspaceStats);
export default router;
//# sourceMappingURL=activityRoutes.js.map