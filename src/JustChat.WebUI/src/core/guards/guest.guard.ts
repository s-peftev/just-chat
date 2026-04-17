import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ROUTES } from "../constants/routes.constants";
import { AuthStore } from "../../features/auth/store/auth.store";

export const GuestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if(!authStore.hasValidAccessToken()) return true;

  router.navigate([ROUTES.PROFILE]);

  return false;
};