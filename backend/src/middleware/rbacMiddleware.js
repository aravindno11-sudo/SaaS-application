import Workspace from '../models/workspaceModel.js';
import Document from '../models/documentModel.js';
export const authorizeWorkspace = (roles) => {
    return async (req, res, next) => {
        try {
            let workspaceId = req.body.workspaceId || req.params.workspaceId || req.params.id || req.query.workspaceId;
            // If no workspaceId, but we have a document ID in params, fetch the document to find its workspace
            if (!workspaceId && req.params.id) {
                const doc = await Document.findById(req.params.id);
                if (doc) {
                    workspaceId = doc.workspace;
                }
            }
            if (!workspaceId) {
                return res.status(400).json({ message: 'Workspace ID is required' });
            }
            const workspace = await Workspace.findOne({
                _id: workspaceId,
                'members.user': req.user._id,
            });
            if (!workspace) {
                return res.status(403).json({ message: 'Not a member of this workspace' });
            }
            const membership = workspace.members.find((m) => m.user.toString() === req.user._id.toString());
            if (!membership || !roles.includes(membership.role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }
            req.workspace = workspace;
            req.userRole = membership.role;
            next();
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};
//# sourceMappingURL=rbacMiddleware.js.map