export declare const getAllBookings: () => Promise<({
    user: {
        name: string;
        email: string;
        password: string;
        phone: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    };
    court: {
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        type: string;
        price: number;
        description: string | null;
        image: string | null;
        isActive: boolean;
    };
} & {
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
})[]>;
export declare const getBookingById: (id: number) => Promise<({
    user: {
        name: string;
        email: string;
        password: string;
        phone: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    };
    court: {
        name: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        type: string;
        price: number;
        description: string | null;
        image: string | null;
        isActive: boolean;
    };
} & {
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
}) | null>;
export declare const createBooking: (data: {
    bookingDate: Date;
    startTime: string;
    endTime: string;
    userId: number;
    courtId: number;
}) => Promise<{
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
}>;
export declare const updateBookingById: (id: number, data: {
    bookingDate?: Date;
    startTime?: string;
    endTime?: string;
    status?: "pending" | "confirmed" | "cancelled" | "completed";
    userId?: number;
    courtId?: number;
}) => Promise<{
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
}>;
export declare const deleteBookingById: (id: number) => Promise<{
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
}>;
//# sourceMappingURL=bookingService.d.ts.map