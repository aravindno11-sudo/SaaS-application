import type { Request, Response, NextFunction } from 'express';
import Workspace from '../models/workspaceModel.js';
import Document from '../models/documentModel.js';

export const checkDocumentLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.body.workspaceId || req.params.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Pro plans have no limits
    if (workspace.subscription?.plan === 'pro') {
      return next();
    }

    // Free plan: Limit to 3 documents
    const documentCount = await Document.countDocuments({ workspace: workspaceId });
    if (documentCount >= 3) {
      return res.status(403).json({
        message: 'Plan limit reached. Free workspaces are limited to 3 documents. Please upgrade to Pro for unlimited documents.',
        limitReached: true
      });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
