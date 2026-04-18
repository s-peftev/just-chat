import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../../core/services/app/api-client.service';
import { LoginRequest } from '../../../dto/auth/login-request.dto';
import { AccessToken } from '../../../dto/auth/access-token.dto';
import { AuthApi } from '../../../core/constants/api/auth-api.constants';
import { Observable } from 'rxjs';
import { RegisterRequest } from '../../../dto/auth/register-request.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _apiClient = inject(ApiClientService);

  public login(loginRequest: LoginRequest): Observable<AccessToken> {
    return this._apiClient.post<LoginRequest, AccessToken>(AuthApi.LOGIN, loginRequest, { withCredentials: true });
  }

  public logout(): Observable<void> {
    return this._apiClient.postVoid(AuthApi.LOGOUT, null, { withCredentials: true });
  }

  public refresh(): Observable<AccessToken> {
    return this._apiClient.postNoIntercept<AccessToken>(AuthApi.REFRESH, undefined, { withCredentials: true });
  }

  public register(registerRequest: RegisterRequest): Observable<AccessToken> {
    return this._apiClient.post<RegisterRequest, AccessToken>(AuthApi.REGISTER, registerRequest, { withCredentials: true });
  }
}