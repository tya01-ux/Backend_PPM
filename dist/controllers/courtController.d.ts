import { Request, Response } from "express";
export declare const getCourts: (req: Request, res: Response) => Promise<void>;
export declare const getCourt: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addCourt: (req: Request, res: Response) => Promise<void>;
export declare const updateCourt: (req: Request, res: Response) => Promise<void>;
export declare const deleteCourt: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=courtController.d.ts.map