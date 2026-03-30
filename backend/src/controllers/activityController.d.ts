import type { Request, Response } from 'express';
export declare const logActivity: (workspaceId: string, userId: string, action: string, entityId?: string, entityType?: string, details?: string) => Promise<void>;
export declare const getWorkspaceActivity: (req: Request, res: Response) => Promise<void>;
export declare const getWorkspaceStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=activityController.d.ts.map