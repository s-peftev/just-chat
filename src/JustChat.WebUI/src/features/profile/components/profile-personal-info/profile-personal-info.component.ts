import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileStore } from '../../store/profile.store';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { USER_AUTH } from '../../../../core/constants/validation.constants';

@Component({
  selector: 'app-profile-personal-info',
  imports: [ReactiveFormsModule, TextInputComponent],
  templateUrl: './profile-personal-info.component.html',
})
export class ProfilePersonalInfoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  protected readonly profileStore = inject(ProfileStore);

  protected readonly personalForm = this.fb.group({
    firstName: this.fb.control<string>('', {
      validators: [Validators.maxLength(USER_AUTH.NAME_MAX_LENGTH)],
    }),
    lastName: this.fb.control<string>('', {
      validators: [Validators.maxLength(USER_AUTH.NAME_MAX_LENGTH)],
    }),
  });

  constructor() {
    effect(() => {
      if (!this.profileStore.userId()) return;

      this.personalForm.patchValue(
        {
          firstName: this.profileStore.firstName() ?? '',
          lastName: this.profileStore.lastName() ?? '',
        },
        { emitEvent: false },
      );
    });
  }

  protected savePersonalInfo(): void {
    if (this.personalForm.invalid) return;

    const v = this.personalForm.getRawValue();
    this.profileStore
      .changePersonalInfo({
        firstName: (v.firstName ?? '').trim() || null,
        lastName: (v.lastName ?? '').trim() || null,
      })
      .subscribe({
        next: () => {
          this.toastr.success('Profile updated.');
          this.personalForm.markAsPristine();
        },
      });
  }
}
