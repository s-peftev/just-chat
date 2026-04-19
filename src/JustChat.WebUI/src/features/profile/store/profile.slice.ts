export interface ProfileSlice {
    readonly userId: string | null;
    readonly email: string | null;
    readonly firstName: string | null;
    readonly lastName: string | null;
    readonly profilePhotoUrl: string | null;
}

export const initialProfileSlice: ProfileSlice = {
    userId: null,
    email: null,
    firstName: null,
    lastName: null,
    profilePhotoUrl: null,
}