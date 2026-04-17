export interface AuthSlice {
    readonly accessToken: string | null;
    readonly isPasswordResetRequested: boolean;
}

export const initialAuthSlice: AuthSlice = {
    accessToken: null,
    isPasswordResetRequested: false
}