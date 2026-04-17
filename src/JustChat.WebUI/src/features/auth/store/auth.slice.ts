export interface AuthSlice {
    readonly accessToken: string | null;
}

export const initialAuthSlice: AuthSlice = {
    accessToken: null
}