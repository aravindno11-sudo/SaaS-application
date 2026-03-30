import type { Request, Response, NextFunction } from 'express';
export declare const authorizeWorkspace: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rbacMiddleware.d.ts.map