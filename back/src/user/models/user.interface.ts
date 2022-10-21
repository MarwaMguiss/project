export interface User {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    phone?: number;
    role?: UserRole; 
}

export enum UserRole {
       ADMIN = 'admin',
       USERS = 'user' 
}