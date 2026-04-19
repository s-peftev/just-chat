export const USER_AUTH = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 20,
    NAME_MAX_LENGTH: 20,
    EMAIL_MAX_LENGTH: 254,
};

/** MIME types allowed for profile avatar upload (aligned with backend `ProfilePhotoValidationRules`). */
const AVATAR_ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export const USER_PROFILE = {
  MAX_AVATAR_SIZE_MB: 4,
  AVATAR_ALLOWED_MIME_TYPES,
  /** Value for `<input type="file" accept="...">`. */
  AVATAR_ACCEPT: AVATAR_ALLOWED_MIME_TYPES.join(','),
  /** Short label for user-facing messages (toasts, etc.). */
  AVATAR_ALLOWED_FORMATS_LABEL: 'PNG, JPEG, or WebP',
} as const;