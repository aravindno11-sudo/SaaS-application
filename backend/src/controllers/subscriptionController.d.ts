import type { Request, Response } from 'express';
export declare const createCheckoutSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const mockUpgrade: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createRazorpayOrder: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=subscriptionController.d.ts.map