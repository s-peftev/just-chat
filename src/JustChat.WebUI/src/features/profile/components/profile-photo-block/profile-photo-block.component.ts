import { Component, computed, inject } from '@angular/core';
import { ProfileStore } from '../../store/profile.store';

@Component({
  selector: 'app-profile-photo-block',
  imports: [],
  templateUrl: './profile-photo-block.component.html',
})
export class ProfilePhotoBlockComponent {
  protected readonly profileStore = inject(ProfileStore);

  protected readonly initials = computed(() => {
    const f = this.profileStore.firstName()?.trim();
    const l = this.profileStore.lastName()?.trim();
    const a = f?.[0];
    const b = l?.[0];
    if (a && b) return `${a}${b}`.toUpperCase();
    if (a) return a.toUpperCase();
    if (b) return b.toUpperCase();
    const email = this.profileStore.email()?.trim();
    return email ? email[0]!.toUpperCase() : '?';
  });

  protected readonly profilePhotoUrl = computed(() => this.profileStore.profilePhotoUrl());

  protected onPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.profileStore.uploadProfilePhoto(file);
  }

  protected triggerPhotoInput(input: HTMLInputElement): void {
    input.click();
  }

  protected confirmDeletePhoto(): void {
    if (!this.profileStore.hasProfilePhoto()) return;
    if (!globalThis.confirm('Remove your profile photo?')) return;
    this.profileStore.deleteProfilePhoto();
  }
}
