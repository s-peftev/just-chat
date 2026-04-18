import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROUTES } from '../../../../core/constants/routes.constants';
import { AuthStore } from '../../store/auth.store';
import { USER_AUTH } from '../../../../core/constants/validation.constants';
import { LoginRequest } from '../../../../dto/auth/login-request.dto';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { RouterLink } from '@angular/router';
import { BusyComponent } from "../../../../shared/components/busy/busy.component";
import { environment } from '../../../../environments/environment';
import { GoogleIdentityService } from '../../services/google-identity.service';

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
export class LoginComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private readonly googleIdentity = inject(GoogleIdentityService);

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

  protected readonly googleSignInEnabled = !!environment.googleClientId?.trim();

  @ViewChild('googleSignInHost', { read: ElementRef }) private googleSignInHost?: ElementRef<HTMLElement>;

  constructor() {
    this.initForm();
  }

  ngAfterViewInit(): void {
    void this.mountGoogleSignIn();
  }

  ngOnDestroy(): void {
    const el = this.googleSignInHost?.nativeElement;
    if (el) {
      this.googleIdentity.dispose(el);
    }
  }

  private async mountGoogleSignIn(): Promise<void> {
    if (!this.googleSignInEnabled) {
      return;
    }

    const el = this.googleSignInHost?.nativeElement;
    if (!el) {
      return;
    }

    await this.googleIdentity.mountSignInButton(el, (idToken) => {
      this.authStore.loginWithGoogle({ idToken });
    });
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
