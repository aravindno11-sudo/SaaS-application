import Activity from '../models/activityModel.js';
import Document from '../models/documentModel.js';
import Workspace from '../models/workspaceModel.js';
export const logActivity = async (workspaceId, userId, action, entityId, entityType, details) => {
    try {
        await Activity.create({
            workspace: workspaceId,
            user: userId,
            action,
            entityId,
            entityType,
            details,
        });
    }
    catch (error) {
        console.error('Failed to log activity:', error);
    }
};
export const getWorkspaceActivity = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const activities = await Activity.find({ workspace: workspaceId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(activities);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getWorkspaceStats = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const [docCount, memberCount] = await Promise.all([
            Document.countDocuments({ workspace: workspaceId }),
            Workspace.findById(workspaceId).then(ws => ws?.members.length || 0)
        ]);
        res.json({
            documents: docCount,
            members: memberCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=activityController.js.map