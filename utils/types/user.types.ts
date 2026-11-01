export type RoleType = "admin" | "manager" | "cashier" 
export type GenderType = "male" | "female" | "other";

export type User = {
    id: string;
    name: string;
    email: string;
    role : RoleType;
    gender: GenderType
    phone: string;
    last_login_at: string;
    created_at: string;
}

