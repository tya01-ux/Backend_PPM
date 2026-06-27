export declare const getAllPromos: () => Promise<{
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
}[]>;
export declare const createPromo: (data: {
    code: string;
    discount: number;
    isPercent?: boolean;
    maxDiscount?: number;
    startDate: Date;
    endDate: Date;
}) => Promise<{
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
}>;
export declare const updatePromoById: (id: number, data: {
    code?: string;
    discount?: number;
    isPercent?: boolean;
    maxDiscount?: number;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
}) => Promise<{
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
}>;
export declare const deletePromoById: (id: number) => Promise<{
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
}>;
export declare const validatePromo: (code: string, courtPrice: number) => Promise<{
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
    };
    discount: number;
}>;
//# sourceMappingURL=promoService.d.ts.map