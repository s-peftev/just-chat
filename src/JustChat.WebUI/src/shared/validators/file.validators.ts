import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const FILE_VALIDATION_ERRORS = {
  fileSize: 'fileSize',
  fileType: 'fileType',
} as const;

export function fileSizeValidator(maxBytes: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null) {
      return null;
    }
    const file = value as File;
    if (!(file instanceof File)) {
      return null;
    }
    if (file.size > maxBytes) {
      return {
        [FILE_VALIDATION_ERRORS.fileSize]: {
          maxBytes,
          actualSize: file.size,
        },
      };
    }
    return null;
  };
}

export function fileTypeValidator(allowedMimeTypes: readonly string[]): ValidatorFn {
  const allowed = allowedMimeTypes.map((t) => t.toLowerCase());
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null) {
      return null;
    }
    const file = value as File;
    if (!(file instanceof File)) {
      return null;
    }
    const type = file.type?.toLowerCase() ?? '';
    if (!allowed.includes(type)) {
      return {
        [FILE_VALIDATION_ERRORS.fileType]: {
          allowedMimeTypes: [...allowedMimeTypes],
          actualType: file.type,
        },
      };
    }
    return null;
  };
}
