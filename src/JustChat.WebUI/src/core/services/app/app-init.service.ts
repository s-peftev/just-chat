import { inject, Injectable } from "@angular/core";
import { AuthStore } from "../../../features/auth/store/auth.store";
import { catchError, map, Observable, of, switchMap, tap, timer } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  private authStore = inject(AuthStore);
  // private profileStore = inject(ProfileStore);

  public initApp(): Observable<null> {
    const started = Date.now();

    return this.authStore.refresh().pipe(
      catchError(() => of(null)),

      tap(() => {
        if (this.authStore.hasValidAccessToken()) {
          // this.profileStore.getMyProfile();
        }
      }),

      switchMap(() => {
        const elapsed = Date.now() - started;
        const minDelay = 500;
        return elapsed < minDelay
          ? timer(minDelay - elapsed).pipe(map(() => null))
          : of(null);
      })
    );
  }
}