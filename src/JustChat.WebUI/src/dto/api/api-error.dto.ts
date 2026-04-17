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