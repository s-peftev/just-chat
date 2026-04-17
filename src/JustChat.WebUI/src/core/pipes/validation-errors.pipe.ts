import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'validationErrors'
})
export class ValidationErrorsPipe implements PipeTransform {

  transform(errors: ValidationErrors | null | undefined): string {
    if (!errors) return '';

    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return '';

    const firstError = errorKeys[0];

    const messages: Record<string, any> = {
      required: () => 'This field is required',
      minlength: (err: { requiredLength: number; actualLength: number }) => 
        `Minimum length is ${err.requiredLength} characters`,
      maxlength: (err: { requiredLength: number; actualLength: number }) =>
        `Maximum length is ${err.requiredLength} characters`,
      email: () => 'Invalid email format',
    };

    const messageFactory = messages[firstError];
    
    return messageFactory ? messageFactory(errors[firstError]) : 'Invalid value';
  }
}