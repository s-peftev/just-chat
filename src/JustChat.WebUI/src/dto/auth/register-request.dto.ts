export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string | null;
    lastName: string | null;
}