import { Component, inject } from '@angular/core';
import { ProfileStore } from './store/profile.store';
import { BusyComponent } from '../../shared/components/busy/busy.component';
import { ProfilePhotoBlockComponent } from './components/profile-photo-block/profile-photo-block.component';
import { ProfilePersonalInfoComponent } from './components/profile-personal-info/profile-personal-info.component';

@Component({
  selector: 'app-profile',
  imports: [BusyComponent, ProfilePhotoBlockComponent, ProfilePersonalInfoComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  protected readonly profileStore = inject(ProfileStore);
}
