export declare const registerUser: (name: string, email: string, password: string, phone: string) => Promise<{
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
}>;
export declare const loginUser: (email: string, password: string) => Promise<{
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}>;
//# sourceMappingURL=AuthService.d.ts.map