export declare const getPaymentChannels: () => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: import("@prisma/client").$Enums.PaymentChannelType;
    isActive: boolean;
    accountNumber: string | null;
    accountName: string | null;
    qrImage: string | null;
}[]>;
export declare const choosePaymentChannel: (bookingId: number, userId: number, role: string, paymentChannelId: number, promoCode?: string) => Promise<{
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
}>;
export declare const uploadPaymentProof: (bookingId: number, userId: number, role: string, filename: string) => Promise<{
    message: string;
}>;
export declare const confirmPayment: (bookingId: number) => Promise<{
    message: string;
}>;
export declare const rejectPayment: (bookingId: number, note: string) => Promise<{
    message: string;
}>;
export declare const getPaymentByBookingId: (bookingId: number, userId: number, role: string) => Promise<{
    booking: {
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
    };
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
}>;
export declare const createPaymentChannel: (data: {
    name: string;
    type: "transfer" | "qris" | "cash";
    accountNumber?: string;
    accountName?: string;
    qrImage?: string;
}) => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: import("@prisma/client").$Enums.PaymentChannelType;
    isActive: boolean;
    accountNumber: string | null;
    accountName: string | null;
    qrImage: string | null;
}>;
export declare const updatePaymentChannel: (id: number, data: {
    name?: string;
    type?: "transfer" | "qris" | "cash";
    accountNumber?: string;
    accountName?: string;
    qrImage?: string;
    isActive?: boolean;
}) => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: import("@prisma/client").$Enums.PaymentChannelType;
    isActive: boolean;
    accountNumber: string | null;
    accountName: string | null;
    qrImage: string | null;
}>;
export declare const deletePaymentChannel: (id: number) => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: import("@prisma/client").$Enums.PaymentChannelType;
    isActive: boolean;
    accountNumber: string | null;
    accountName: string | null;
    qrImage: string | null;
}>;
//# sourceMappingURL=paymentService.d.ts.map