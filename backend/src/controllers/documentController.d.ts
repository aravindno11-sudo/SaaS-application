import type { Request, Response } from 'express';
export declare const createDocument: (req: Request, res: Response) => Promise<void>;
export declare const getWorkspaceDocuments: (req: Request, res: Response) => Promise<void>;
export declare const getDocumentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const exportDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=documentController.d.ts.map