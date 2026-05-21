import { Request, Response } from "express";
export declare const getSpeakers: (req: Request, res: Response) => Promise<void>;
export declare const createSpeaker: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const showSpeaker: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateSpeaker: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteSpeaker: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=speakerController.d.ts.map