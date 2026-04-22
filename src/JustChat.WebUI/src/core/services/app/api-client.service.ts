import { HttpBackend, HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiResponse } from "../../../dto/api/api-response.dto";
import { ApiError, DefaultErrors } from "../../../dto/api/api-error.dto";
import { map, Observable } from "rxjs";

/**
 * Typed HTTP helpers for API responses wrapped in `{ success, data, error }`.
 * Uses the injected `HttpClient` (interceptors on) by default; `postNoIntercept` uses `HttpBackend` for auth flows that must not trigger the auth interceptor.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private http = inject(HttpClient);
  private httpBackendHandler = inject(HttpBackend);
  private httpNoIntercept = new HttpClient(this.httpBackendHandler);

  /** Throws `ApiError` on failure or when `success` but `data` is missing (strict envelope contract). */
  private unwrapStrict<T>(response: ApiResponse<T>): T {
    if (!response.success) throw (response.error ?? DefaultErrors.UnknownError) as ApiError;
    if (!response.data) throw DefaultErrors.NoDataError;

    return response.data;
  }

  /** Like `unwrapStrict` but ignores `data` for void endpoints (204-style bodies still wrapped). */
  private unwrapVoid<T>(response: ApiResponse<T>): void {
    if (!response.success) throw (response.error ?? DefaultErrors.UnknownError) as ApiError;
    return;
  }

  public get<T>(url: string, options?: { [key: string]: any }): Observable<T> {

    return this.http.get<ApiResponse<T>>(url, { ...options, observe: 'body' })
      .pipe(
        map(this.unwrapStrict)
      );
  }

  public post<T, R = T>(url: string, body?: T, options?: { [key: string]: any }): Observable<R> {

    return this.http.post<ApiResponse<R>>(url, body ?? null, { ...options, observe: 'body' })
      .pipe(
        map(this.unwrapStrict)
      );
  }

  public postVoid(url: string, body?: any, options?: { [key: string]: any }): Observable<void> {

    return this.http.post<ApiResponse<null>>(url, body ?? null, { ...options, observe: 'body' })
      .pipe(
        map(this.unwrapVoid)
      );
  }

  /** POST using a client wired to `HttpBackend` so the auth interceptor does not run (e.g. login / refresh token calls). */
  public postNoIntercept<T, R = T>(url: string, body?: T, options?: { [key: string]: any }): Observable<R> {
    return this.httpNoIntercept.post<ApiResponse<R>>(url, body ?? null, { ...options, observe: 'body' })
      .pipe(
        map(this.unwrapStrict)
      );
  }

  public put<T, R = T>(url: string, body?: T, options?: { [key: string]: any }): Observable<R> {

    return this.http.put<ApiResponse<R>>(url, body ?? null, { ...options, observe: 'body' })
      .pipe(
        map(this.unwrapStrict)
      );
  }

  public delete<T>(url: string, options?: { [key: string]: any }): Observable<T> {

    return this.http.delete<ApiResponse<T>>(url, { ...options, observe: 'body' })
      .pipe(
        map(this.unwrapStrict)
      );
  }

  public deleteVoid(url: string, options?: { [key: string]: any }): Observable<void> {

    return this.http.delete<ApiResponse<null>>(url, { ...options, observe: 'body' })
      .pipe(
        map(this.unwrapVoid)
      );
  }

  public patchVoid<T>(url: string, body?: T, options?: { [key: string]: any }): Observable<void> {

    return this.http.patch<ApiResponse<null>>(url, body ?? null, { ...options, observe: 'body' })
      .pipe(
        map(this.unwrapVoid)
      );
  }
}