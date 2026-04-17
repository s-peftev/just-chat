import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROUTES } from '../../../../core/constants/routes.constants';
import { AuthStore } from '../../store/auth.store';
import { USER_AUTH } from '../../../../core/constants/validation.constants';
import { LoginRequest } from '../../../../dto/auth/login-request.dto';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    TextInputComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  protected loginForm: FormGroup = new FormGroup({});

  public authStore = inject(AuthStore);
  public ROUTES = ROUTES.AUTH;

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(USER_AUTH.EMAIL_MAX_LENGTH)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(USER_AUTH.PASSWORD_MIN_LENGTH),
        Validators.maxLength(USER_AUTH.PASSWORD_MAX_LENGTH),
      ]],
    });
  }

  public login() {
    if (this.loginForm.invalid) return;

    const request: LoginRequest = this.loginForm.value;

    this.authStore.login(request);
  }
}
