import { Request, Response, NextFunction } from "express";
export interface CustomRequest extends Request {
    user?: {
        userId: number;
        email?: string;
    };
}
export declare const authenticate: (req: CustomRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const checkAdmin: (req: CustomRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMiddleware.d.ts.map