import { ApiError } from "../../../dto/api/api-error.dto";

export interface LocalErrorSlice {
    readonly error: ApiError | null;
}

export const initialLocalErrorSlice: LocalErrorSlice = {
    error: null
};