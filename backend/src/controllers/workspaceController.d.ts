import type { Request, Response } from 'express';
export declare const createWorkspace: (req: Request, res: Response) => Promise<void>;
export declare const getMyWorkspaces: (req: Request, res: Response) => Promise<void>;
export declare const addMember: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteWorkspace: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=workspaceController.d.ts.map