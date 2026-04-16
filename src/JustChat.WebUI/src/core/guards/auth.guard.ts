import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "../../features/auth/store/auth.store";
import { ROUTES } from "../constants/routes.constants";

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if(authStore.hasValidAccessToken()) return true;
  
  router.navigate([ROUTES.AUTH.LOGIN]);
  
  return false;
};