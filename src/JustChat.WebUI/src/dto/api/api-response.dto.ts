import { ApiError } from "./api-error.dto";

export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: ApiError | null;
}