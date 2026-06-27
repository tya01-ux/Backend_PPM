export declare const getAllCourts: () => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: string;
    price: number;
    description: string | null;
    image: string | null;
    isActive: boolean;
}[]>;
export declare const getCourtById: (id: number) => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: string;
    price: number;
    description: string | null;
    image: string | null;
    isActive: boolean;
} | null>;
export declare const createCourt: (data: {
    name: string;
    type: string;
    price: number;
    description?: string;
    image?: string;
    isActive?: boolean;
}) => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: string;
    price: number;
    description: string | null;
    image: string | null;
    isActive: boolean;
}>;
export declare const updateCourtById: (id: number, data: {
    name?: string;
    type?: string;
    price?: number;
    description?: string;
    image?: string;
    isActive?: boolean;
}) => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: string;
    price: number;
    description: string | null;
    image: string | null;
    isActive: boolean;
}>;
export declare const deleteCourtById: (id: number) => Promise<{
    name: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    type: string;
    price: number;
    description: string | null;
    image: string | null;
    isActive: boolean;
}>;
//# sourceMappingURL=courtService.d.ts.map