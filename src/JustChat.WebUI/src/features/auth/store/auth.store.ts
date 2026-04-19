import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, exhaustMap, filter, finalize, map, Observable, of, tap, throwError } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { initialAuthSlice } from "./auth.slice";
import { computed, effect, inject } from "@angular/core";
import { jwtDecode } from 'jwt-decode';
import { NavigationEnd, Router } from "@angular/router";
import { LoginRequest } from "../../../dto/auth/login-request.dto";
import { setBusy, setIdle } from "../../../store-extentions/features/with-busy/with-busy.updaters";
import { withBusy } from "../../../store-extentions/features/with-busy/with-busy.feature";
import { AuthService } from "../services/auth.service";
import { withLocalError } from "../../../store-extentions/features/with-local-error/with-local-error.feature";
import { clearError, setError } from "../../../store-extentions/features/with-local-error/with-local-error.updaters";
import { ROUTES } from "../../../core/constants/routes.constants";
import { ApiError, DefaultErrors, formatApiErrorMessage, isApiError } from "../../../dto/api/api-error.dto";
import { ToastrService } from "ngx-toastr";
import { setAccessToken, setPasswordResetRequested } from "./auth.updaters";
import { AccessToken } from "../../../dto/auth/access-token.dto";
import { RegisterRequest } from "../../../dto/auth/register-request.dto";
import { GoogleLoginRequest } from "../../../dto/auth/google-login-request.dto";
import { ProfileStore } from "../../profile/store/profile.store";

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialAuthSlice),
    withBusy(),
    withLocalError(),
    withProps(() => {
        const _authService = inject(AuthService);
        const _profileStore = inject(ProfileStore);

        return {
            _authService,
            _profileStore
        }
    }),
    withComputed((store) => {
        const hasValidAccessToken = computed(() => {
            const token = store.accessToken();
            if (!token) return false;

            try {
                const decoded = jwtDecode(token);
                const exp = decoded.exp;

                if (!exp) return false;

                return exp > Math.floor(Date.now() / 1000);
            } catch (error) {
                return false;
            }
        });

        return {
            hasValidAccessToken
        };
    }),
    withMethods((store) => {
        const router = inject(Router);
        const toastr = inject(ToastrService);

        return {
            login: rxMethod<LoginRequest>(input$ => input$.pipe(
                tap(_ => patchState(store, setBusy())),
                exhaustMap(request =>
                    store._authService.login(request).pipe(
                        tapResponse({
                            next: response => {
                                patchState(store, 
                                    setAccessToken(response),
                                    clearError());
                                
                                store._profileStore.getMyProfile();

                                router.navigate([ROUTES.PROFILE]);
                            },
                            error: (err: any) => {
                                const apiErr: ApiError = isApiError(err?.error?.error)
                                    ? (err.error.error as ApiError)
                                    : DefaultErrors.UnexpectedError;
                                patchState(store, setError(apiErr));
                                toastr.error(formatApiErrorMessage(apiErr));
                            },
                            finalize: () => {
                                patchState(store, setIdle());
                            }
                        })
                    )
                )
            )),

            loginWithGoogle: rxMethod<GoogleLoginRequest>(input$ => input$.pipe(
                tap(_ => patchState(store, setBusy())),
                exhaustMap(request =>
                    store._authService.loginWithGoogle(request).pipe(
                        tapResponse({
                            next: response => {
                                patchState(store, 
                                    setAccessToken(response),
                                    clearError());
                                
                                store._profileStore.getMyProfile();

                                router.navigate([ROUTES.PROFILE]);
                            },
                            error: (err: any) => {
                                const apiErr: ApiError = isApiError(err?.error?.error)
                                    ? (err.error.error as ApiError)
                                    : DefaultErrors.UnexpectedError;
                                patchState(store, setError(apiErr));
                                toastr.error(formatApiErrorMessage(apiErr));
                            },
                            finalize: () => {
                                patchState(store, setIdle());
                            }
                        })
                    )
                )
            )),

            logout: rxMethod<void>(trigger$ => trigger$.pipe(
                tap(_ => patchState(store, setBusy())),
                exhaustMap(_ =>
                    store._authService.logout().pipe(
                        finalize(() => {
                            patchState(store, initialAuthSlice, setIdle());
                            store._profileStore.resetState();
                            router.navigate([ROUTES.AUTH.LOGIN]);
                        })
                    )
                )
            )),

            refresh: (): Observable<AccessToken> => {
                return store._authService.refresh().pipe(
                    tap((response) => patchState(store,
                        setAccessToken(response),
                    )),

                    catchError((err) => {
                        patchState(store, initialAuthSlice);
                        return throwError(() => err);
                    })
                );
            },

            register: rxMethod<RegisterRequest>(input$ => input$.pipe(
                tap(_ => patchState(store, setBusy())),
                exhaustMap(request =>
                    store._authService.register(request).pipe(
                        tapResponse({
                            next: response => {
                                store._profileStore.getMyProfile();

                                patchState(store,
                                    setAccessToken(response),
                                    clearError());

                                router.navigate([ROUTES.PROFILE]);
                            },
                            error: (err: any) => {
                                const apiErr: ApiError = isApiError(err?.error?.error)
                                    ? (err.error.error as ApiError)
                                    : DefaultErrors.UnexpectedError;
                                patchState(store, setError(apiErr));
                                toastr.error(formatApiErrorMessage(apiErr));
                            },
                            finalize: () => {
                                patchState(store, setIdle());
                            }
                        })
                    )
                )
            )),

            setPasswordResetRequested: (isPasswordResetRequested: boolean) =>
                patchState(store, setPasswordResetRequested(isPasswordResetRequested)),
        };
    }),
    withHooks(store => {
        const router = inject(Router);

        const urlSig = toSignal(router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            map(() => router.url)
        ), { initialValue: router.url });

        return {
            onInit: () => {
                //clear error after route changing
                let first = true;
                effect(() => {
                    urlSig();

                    if (first) {
                        first = false;
                        return;
                    }
                    patchState(store, clearError());
                });
            }
        }
    }),
    withDevtools('auth-store')
);