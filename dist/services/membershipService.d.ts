export declare const getAllMemberships: () => Promise<{
    name: string;
    id: number;
    price: number;
    description: string | null;
    duration: number;
}[]>;
export declare const getMembershipById: (id: number) => Promise<{
    name: string;
    id: number;
    price: number;
    description: string | null;
    duration: number;
} | null>;
export declare const createMembership: (data: {
    name: string;
    price: number;
    duration: number;
    description?: string;
}) => Promise<{
    name: string;
    id: number;
    price: number;
    description: string | null;
    duration: number;
}>;
export declare const updateMembershipById: (id: number, data: {
    name?: string;
    price?: number;
    duration?: number;
    description?: string;
}) => Promise<{
    name: string;
    id: number;
    price: number;
    description: string | null;
    duration: number;
}>;
export declare const deleteMembershipById: (id: number) => Promise<{
    name: string;
    id: number;
    price: number;
    description: string | null;
    duration: number;
}>;
//# sourceMappingURL=membershipService.d.ts.map