import { Component, inject } from '@angular/core';
import { AuthStore } from '../auth/store/auth.store';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  public authStore = inject(AuthStore);

  public logout() {
    this.authStore.logout();
  }
}
