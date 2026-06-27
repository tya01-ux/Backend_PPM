export declare const getAllBookings: (userId?: number, role?: string) => Promise<({
    user: {
        name: string;
        email: string;
        phone: string | null;
        id: number;
    };
    court: {
        name: string;
        id: number;
        type: string;
        image: string | null;
    };
    payment: {
        status: import("@prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        expiredAt: Date | null;
    } | null;
} & {
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingCode: string;
    startAt: Date;
    endAt: Date;
    duration: number;
    courtPrice: number;
    notes: string | null;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
})[]>;
export declare const getBookingById: (id: number) => Promise<({
    user: {
        name: string;
        email: string;
        phone: string | null;
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
    payment: ({
        channel: {
            name: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            type: import("@prisma/client").$Enums.PaymentChannelType;
            isActive: boolean;
            accountNumber: string | null;
            accountName: string | null;
            qrImage: string | null;
        } | null;
        promo: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            isActive: boolean;
            discount: number;
            code: string;
            isPercent: boolean;
            maxDiscount: number | null;
            startDate: Date;
            endDate: Date;
        } | null;
        proofs: {
            id: number;
            image: string;
            paymentId: number;
            uploadedAt: Date;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        courtPrice: number;
        status: import("@prisma/client").$Enums.PaymentStatus;
        bookingId: number;
        paymentChannelId: number | null;
        promoId: number | null;
        adminFee: number;
        discount: number;
        totalAmount: number;
        paidAt: Date | null;
        expiredAt: Date | null;
        confirmedAt: Date | null;
        note: string | null;
    }) | null;
} & {
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingCode: string;
    startAt: Date;
    endAt: Date;
    duration: number;
    courtPrice: number;
    notes: string | null;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
}) | null>;
export declare const createBooking: (data: {
    startAt: Date;
    endAt: Date;
    notes?: string;
    userId: number;
    courtId: number;
}) => Promise<{
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
    payment: {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        courtPrice: number;
        status: import("@prisma/client").$Enums.PaymentStatus;
        bookingId: number;
        paymentChannelId: number | null;
        promoId: number | null;
        adminFee: number;
        discount: number;
        totalAmount: number;
        paidAt: Date | null;
        expiredAt: Date | null;
        confirmedAt: Date | null;
        note: string | null;
    } | null;
} & {
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingCode: string;
    startAt: Date;
    endAt: Date;
    duration: number;
    courtPrice: number;
    notes: string | null;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
}>;
export declare const cancelBooking: (id: number, userId: number, role: string) => Promise<[{
    createdAt: Date;
    updatedAt: Date;
    id: number;
    bookingCode: string;
    startAt: Date;
    endAt: Date;
    duration: number;
    courtPrice: number;
    notes: string | null;
    status: import("@prisma/client").$Enums.BookingStatus;
    userId: number;
    courtId: number;
}, ...{
    createdAt: Date;
    updatedAt: Date;
    id: number;
    courtPrice: number;
    status: import("@prisma/client").$Enums.PaymentStatus;
    bookingId: number;
    paymentChannelId: number | null;
    promoId: number | null;
    adminFee: number;
    discount: number;
    totalAmount: number;
    paidAt: Date | null;
    expiredAt: Date | null;
    confirmedAt: Date | null;
    note: string | null;
}[]]>;
//# sourceMappingURL=bookingService.d.ts.map