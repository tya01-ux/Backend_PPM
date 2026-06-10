import { Request, Response, NextFunction } from "express";
export interface CustomRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
}
export declare const checkAdmin: (req: CustomRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=logger.d.ts.map