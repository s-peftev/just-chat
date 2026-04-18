import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../../../core/constants/routes.constants';
import { USER_AUTH } from '../../../../core/constants/validation.constants';
import { BusyComponent } from '../../../../shared/components/busy/busy.component';
import { TextInputComponent } from '../../../../shared/components/text-input/text-input.component';
import { AuthStore } from '../../store/auth.store';
import { RegisterRequest } from '../../../../dto/auth/register-request.dto';
import { environment } from '../../../../environments/environment';
import { GoogleIdentityService } from '../../services/google-identity.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    RouterLink,
    BusyComponent,
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private readonly googleIdentity = inject(GoogleIdentityService);

  protected registerForm: FormGroup = new FormGroup({});

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
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.maxLength(USER_AUTH.NAME_MAX_LENGTH)]],
      lastName: ['', [Validators.maxLength(USER_AUTH.NAME_MAX_LENGTH)]],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(USER_AUTH.EMAIL_MAX_LENGTH),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(USER_AUTH.PASSWORD_MIN_LENGTH),
          Validators.maxLength(USER_AUTH.PASSWORD_MAX_LENGTH),
        ],
      ],
    });
  }

  public register(): void {
    if (this.registerForm.invalid) return;

    const request: RegisterRequest = this.registerForm.value;
    
    this.authStore.register(request);
  }
}
