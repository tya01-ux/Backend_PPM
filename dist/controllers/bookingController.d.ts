import { Response } from "express";
import { CustomRequest } from "../middlewares/authMiddleware.js";
export declare const getBookings: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBooking: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addBooking: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelBookingHandler: (req: CustomRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=bookingController.d.ts.map