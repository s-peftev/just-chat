import { environment } from "../../../environments/environment";

const baseApiUrl = environment.apiUrl + 'auth/';

export const AuthApi = {
    REGISTER: baseApiUrl + 'register',
    LOGIN: baseApiUrl + 'login',
    LOGIN_GOOGLE: baseApiUrl + 'login-google',
    LOGOUT: baseApiUrl + 'logout',
    REFRESH: baseApiUrl + 'refresh',
    PASSWORD: {
        BASE: baseApiUrl + 'password',
        RESET_REQUEST: baseApiUrl + 'password/reset-request',
        RESET: baseApiUrl + 'password/reset'
    }
}