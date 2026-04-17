import { API_ERROR_MESSAGES } from "../../core/constants/api-error-messages.constants";
import { ErrorType } from "../../core/enums/error-type.enum";

export interface ApiError {
  id: string;
  type: ErrorType;
  details?: string[];
}

export const DefaultErrors: Record<'UnknownError' | 'NoDataError' | 'UnexpectedError', ApiError> = {
    UnknownError: {
        id: 'unknown',
        type: ErrorType.None
    },
    NoDataError: {
        id: 'no-data',
        type: ErrorType.InternalServerError
    }, 
    UnexpectedError: {
        id: 'unexpected',
        type: ErrorType.InternalServerError
    }
}

export function isApiError(err: unknown): err is ApiError {
    return typeof err === 'object' && err !== null &&
           'id' in err && 'type' in err;
}

/** Text suitable for a toast or inline alert: prefers `details`, then mapped `id`, then raw `id`. */
export function formatApiErrorMessage(err: ApiError): string {
    if (err.details?.length) {
        return err.details.join('. ');
    }
    return API_ERROR_MESSAGES[err.id] ?? err.id;
}