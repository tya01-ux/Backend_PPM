import { Response } from "express";
import { CustomRequest } from "../middlewares/authMiddleware.js";
type PaymentRequestWithFile = CustomRequest & {
    file?: {
        filename: string;
    };
};
export declare const getChannels: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPayment: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const chooseChannel: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const uploadProof: (req: PaymentRequestWithFile, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const confirm: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const reject: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addChannel: (req: PaymentRequestWithFile, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const editChannel: (req: PaymentRequestWithFile, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeChannel: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=paymentController.d.ts.map