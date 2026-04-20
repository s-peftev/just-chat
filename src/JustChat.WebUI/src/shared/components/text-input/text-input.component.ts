import { Component, input, Self } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { ValidationErrorsPipe } from '../../../core/pipes/validation-errors.pipe';

@Component({
  selector: 'app-text-input',
  imports: [ReactiveFormsModule, ValidationErrorsPipe],
  templateUrl: './text-input.component.html',
})
export class TextInputComponent implements ControlValueAccessor {
  public label = input<string>('');
  public placeholder = input<string>('');
  public type = input<'text' | 'password' | 'email' | 'date'>('text');
  public controlId = input<string | undefined>(undefined);

  private static nextId = 0;
  protected readonly autoId = `app-text-input-${TextInputComponent.nextId++}`;

  protected value = '';
  protected disabled = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
  }

  get control(): FormControl {
    return this.ngControl.control as FormControl;
  }

  get fieldId(): string {
    return this.controlId() ?? this.autoId;
  }

  writeValue(obj: string | null | undefined): void {
    this.value = obj ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value = next;
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected showErrors(): boolean {
    const c = this.control;
    return !!c && c.invalid && (c.dirty || c.touched);
  }
}
