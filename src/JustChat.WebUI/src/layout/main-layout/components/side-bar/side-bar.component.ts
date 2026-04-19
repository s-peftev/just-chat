import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ROUTES } from '../../../../core/constants/routes.constants';
import { AuthStore } from '../../../../features/auth/store/auth.store';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar.component.html',
})
export class SideBarComponent {
  private readonly authStore = inject(AuthStore);

  protected readonly profilePath = ROUTES.PROFILE;
  protected readonly chatPath = ROUTES.CHAT;

  protected logout(): void {
    this.authStore.logout();
  }
}
