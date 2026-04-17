import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../../../core/constants/routes.constants';
import { USER_AUTH } from '../../../../core/constants/validation.constants';
import { BusyComponent } from '../../../../shared/components/busy/busy.component';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    RouterLink,
    BusyComponent,
  ],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);

  protected forgotForm: FormGroup = new FormGroup({});
  /** Email shown in the confirmation step after a successful (stub) submit. */
  protected submittedEmail = '';

  public authStore = inject(AuthStore);
  public ROUTES = ROUTES.AUTH;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.authStore.setPasswordResetRequested(false);
    this.submittedEmail = '';
    this.forgotForm.reset({ email: '' });
  }

  private initForm(): void {
    this.forgotForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(USER_AUTH.EMAIL_MAX_LENGTH),
        ],
      ],
    });
  }

  resetPasswordRequest(): void {
    if (this.forgotForm.invalid) return;

    this.submittedEmail = this.forgotForm.value.email as string;
    this.authStore.setPasswordResetRequested(true);
  }
}
