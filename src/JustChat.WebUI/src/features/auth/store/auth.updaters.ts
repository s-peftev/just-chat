import { PartialStateUpdater } from "@ngrx/signals";
import { AccessToken } from "../../../dto/auth/access-token.dto";
import { AuthSlice } from "./auth.slice";

export function setAccessToken(accessToken: AccessToken): PartialStateUpdater<AuthSlice> {
    return _ => ({
        accessToken: accessToken.tokenValue
    });
}

export function setPasswordResetRequested(isPasswordResetRequested: boolean): PartialStateUpdater<AuthSlice> {
    return _ => ({ isPasswordResetRequested });
}