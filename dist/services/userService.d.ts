export declare const getAllUsers: () => Promise<{
    name: string;
    email: string;
    password: string;
    phone: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
}[]>;
export declare const getUserById: (id: number) => Promise<{
    name: string;
    email: string;
    password: string;
    phone: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
} | null>;
export declare const updateUserById: (id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
}) => Promise<{
    name: string;
    email: string;
    password: string;
    phone: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
}>;
export declare const deleteUserById: (id: number) => Promise<{
    name: string;
    email: string;
    password: string;
    phone: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
}>;
//# sourceMappingURL=userService.d.ts.map