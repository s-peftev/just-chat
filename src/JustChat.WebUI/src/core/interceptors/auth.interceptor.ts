/**
 * Attaches the access token and, on 401, runs a single refresh for all parallel requests:
 * the first caller sets `isRefreshing`, invokes `AuthStore.refresh()`, then publishes the new token on `refreshTokenSubject`;
 * others wait on that subject and retry with the shared token (avoids refresh storms).
 */
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthStore } from '../../features/auth/store/auth.store';
import { inject } from '@angular/core';
import { ROUTES } from '../constants/routes.constants';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authStore = inject(AuthStore);
  const accessToken = authStore.accessToken();

  let request = req;

  if (accessToken) {
    request = addTokenHeader(request, accessToken);
  }

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if(err.status === 401 && !request.url.includes(ROUTES.AUTH.LOGIN)) {
        if(!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authStore.refresh().pipe(
            switchMap(response => {
              refreshTokenSubject.next(response.tokenValue);
              return next(addTokenHeader(request, response.tokenValue));
            }),
            catchError((refreshErr) => {
              authStore.logout();
              return throwError(() => refreshErr);
            }),
            finalize(() => isRefreshing = false)
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => next(addTokenHeader(request, token)))
          );
        }
      } else {
        return throwError(() => err);
      }
    })
  );
};

function addTokenHeader(request: HttpRequest<any>, accessToken: string) {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${accessToken}` }
  });
}