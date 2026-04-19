import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { withLocalError } from "../../../store-extentions/features/with-local-error/with-local-error.feature";
import { withBusy } from "../../../store-extentions/features/with-busy/with-busy.feature";
import { initialProfileSlice } from "./profile.slice";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { ProfileService } from "../services/profile.service";
import { computed, inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { exhaustMap, of, tap } from "rxjs";
import { setBusy, setIdle } from "../../../store-extentions/features/with-busy/with-busy.updaters";
import { tapResponse } from "@ngrx/operators";
import { setMyProfile, setPersonalInfo, setProfilePhoto } from "./profile.updaters";
import { ToastrService } from "ngx-toastr";
import { ApiError, DefaultErrors, formatApiErrorMessage, isApiError } from "../../../dto/api/api-error.dto";
import { clearError, setError } from "../../../store-extentions/features/with-local-error/with-local-error.updaters";
import { ChangePersonalInfoRequest } from "../../../dto/profile/change-personal-info-request.dto";

export const ProfileStore = signalStore(
    { providedIn: 'root' },
    withState(initialProfileSlice),
    withBusy(),
    withLocalError(),
    withProps(() => {
        const _profileService = inject(ProfileService);

        return {
            _profileService
        }
    }),
    withComputed((store) => {
        const hasProfilePhoto = computed(() => !!store.profilePhotoUrl());

        return {
            hasProfilePhoto
        }
    }),
    withMethods((store) => {
        const toastr = inject(ToastrService);

        return {
            getMyProfile: rxMethod<void>(trigger$ => trigger$.pipe(
                tap(_ => patchState(store, setBusy())),
                exhaustMap(_ =>
                    store._profileService.getMyProfile().pipe(
                        tapResponse({
                            next: response => patchState(store, setMyProfile(response)),
                            error: (err: any) => {
                                const apiErr: ApiError = isApiError(err?.error?.error)
                                    ? (err.error.error as ApiError)
                                    : DefaultErrors.UnexpectedError;
                                patchState(store, setError(apiErr));

                                toastr.error(formatApiErrorMessage(apiErr));
                            },
                            finalize: () => patchState(store, setIdle())
                        })
                    )
                ),
            )),

            changePersonalInfo: (request: ChangePersonalInfoRequest) => {
                return of(request).pipe(
                    tap(() => patchState(store, setBusy())),
                    exhaustMap(req =>
                        store._profileService.changePersonalInfo(req).pipe(
                            tapResponse({
                                next: () => patchState(store, setPersonalInfo(req), clearError()),
                                error: (err: any) => {
                                    const apiErr: ApiError = isApiError(err?.error?.error)
                                        ? (err.error.error as ApiError)
                                        : DefaultErrors.UnexpectedError;
                                    patchState(store, setError(apiErr));

                                    toastr.error(formatApiErrorMessage(apiErr));
                                },
                                finalize: () => patchState(store, setIdle())
                            })
                        )
                    )
                );
            },

            uploadProfilePhoto: rxMethod<File>(input$ => input$.pipe(
                tap(_ => patchState(store, setBusy())),
                exhaustMap(file =>
                    store._profileService.uploadProfilePhoto(file).pipe(
                        tapResponse({
                            next: profilePhoto => patchState(store, setProfilePhoto(profilePhoto)),
                            error: (err: any) => {
                                const apiErr: ApiError = isApiError(err?.error?.error)
                                    ? (err.error.error as ApiError)
                                    : DefaultErrors.UnexpectedError;
                                patchState(store, setError(apiErr));

                                toastr.error(formatApiErrorMessage(apiErr));
                            },
                            finalize: () => patchState(store, setIdle())
                        })
                    )
                ),
            )),

            deleteProfilePhoto: rxMethod<void>(trigger$ => trigger$.pipe(
                tap(_ => patchState(store, setBusy())),
                exhaustMap(_ =>
                    store._profileService.deleteProfilePhoto().pipe(
                        tapResponse({
                            next: _ => patchState(store, setProfilePhoto(null)),
                            error: (err: any) => {
                                const apiErr: ApiError = isApiError(err?.error?.error)
                                    ? (err.error.error as ApiError)
                                    : DefaultErrors.UnexpectedError;
                                patchState(store, setError(apiErr));

                                toastr.error(formatApiErrorMessage(apiErr));
                            },
                            finalize: () => patchState(store, setIdle())
                        })
                    )
                )
            )),

            resetState: (): void => patchState(store, initialProfileSlice),
        }
    }),
    withDevtools('profile-store')
);