import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROUTES } from '../../../../core/constants/routes.constants';
import { AuthStore } from '../../store/auth.store';
import { USER_AUTH } from '../../../../core/constants/validation.constants';
import { LoginRequest } from '../../../../dto/auth/login-request.dto';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { RouterLink } from '@angular/router';
import { BusyComponent } from "../../../../shared/components/busy/busy.component";

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    RouterLink,
    BusyComponent
],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  protected loginForm: FormGroup = new FormGroup({});

  /** Keys are the `id` of the demo credential row container in the template. */
  protected readonly demoCredentialsByContainerId: Readonly<
    Record<string, { email: string; password: string }>
  > = {
    'demo-creds-1': { email: 'testuser@example.com', password: 'Test123!' },
    'demo-creds-2': { email: 'testuser2@example.com', password: 'Test123!' },
  };

  protected readonly demoCredentialRows = Object.entries(this.demoCredentialsByContainerId).map(
    ([id, creds]) => ({ id, email: creds.email, password: creds.password }),
  );

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

  protected useDemoCreds(containerId: string): void {
    const creds = this.demoCredentialsByContainerId[containerId];
    if (!creds) return;

    this.loginForm.patchValue({ email: creds.email, password: creds.password });
  }
}
