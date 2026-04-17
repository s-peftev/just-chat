/**
 * User-facing English messages for API {@link ApiError} `id` values.
 * Keep in sync with backend: `JustChat.Application.Constants.ErrorIDs` and `DefaultErrors` in `api-error.dto.ts`.
 */
export const API_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  // GeneralErrorIDs
  NotFound: 'The requested resource was not found.',
  InvalidRequest: 'The request is invalid.',
  Unauthorized: 'You are not authorized to perform this action.',
  Conflict: 'This operation conflicts with the current state.',
  BusinessLogicError: 'The operation could not be completed due to a business rule.',
  InternalServerError: 'An unexpected server error occurred. Please try again later.',
  ServiceUnavailable: 'The service is temporarily unavailable. Please try again later.',
  Forbidden: 'Access to this resource is forbidden.',

  // UserErrorIDs
  LoginFailed: 'Invalid email or password.',
  RefreshTokenInvalid: 'Your session has expired. Please sign in again.',
  TokenMissing: 'Authentication token is missing.',

  // ExceptionErrorIDs
  RequestCancelled: 'The request was cancelled.',
  Timeout: 'The request timed out. Please try again.',

  // Client-side DefaultErrors ids (when API shape is missing)
  unknown: 'An unknown error occurred.',
  'no-data': 'No data was returned.',
  unexpected: 'Something went wrong. Please try again.',
};
