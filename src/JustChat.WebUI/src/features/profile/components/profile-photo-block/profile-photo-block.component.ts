import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { USER_PROFILE } from '../../../../core/constants/validation.constants';
import {
  FILE_VALIDATION_ERRORS,
  fileSizeValidator,
  fileTypeValidator,
} from '../../../../shared/validators/file.validators';
import { ProfilePhotoCropModalComponent } from '../profile-photo-crop-modal/profile-photo-crop-modal.component';
import { userInitialsFromDetails } from '../../../../core/utils/user-initials';
import { ProfileStore } from '../../store/profile.store';

const maxAvatarBytes = USER_PROFILE.MAX_AVATAR_SIZE_MB * 1024 * 1024;

@Component({
  selector: 'app-profile-photo-block',
  imports: [ProfilePhotoCropModalComponent],
  templateUrl: './profile-photo-block.component.html',
  host: {
    class: 'block w-full min-w-[200px] max-w-[250px]',
  },
})
export class ProfilePhotoBlockComponent {
  private readonly toastr = inject(ToastrService);
  protected readonly profileStore = inject(ProfileStore);

  protected readonly maxAvatarSizeMb = USER_PROFILE.MAX_AVATAR_SIZE_MB;
  protected readonly avatarAccept = USER_PROFILE.AVATAR_ACCEPT;

  protected readonly fileControl = new FormControl<File | null>(null, {
    validators: [
      fileSizeValidator(maxAvatarBytes),
      fileTypeValidator(USER_PROFILE.AVATAR_ALLOWED_MIME_TYPES),
    ],
  });

  protected readonly initials = computed(() =>
    userInitialsFromDetails({
      firstName: this.profileStore.firstName(),
      lastName: this.profileStore.lastName(),
      email: this.profileStore.email(),
    }),
  );

  protected readonly profilePhotoUrl = computed(() => this.profileStore.profilePhotoUrl());

  /** Custom confirm dialog instead of `window.confirm` for deleting the avatar. */
  protected readonly deletePhotoModalOpen = signal(false);

  /** Object URL for image shown in Cropper before upload. */
  protected readonly cropImageUrl = signal<string | null>(null);
  protected readonly cropModalOpen = signal(false);

  protected onPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.fileControl.setValue(file);

    if (!this.fileControl.valid) {
      this.showFileValidationErrors();
      this.fileControl.setValue(null, { emitEvent: false });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    this.cropImageUrl.set(objectUrl);
    this.cropModalOpen.set(true);
    this.fileControl.setValue(null, { emitEvent: false });
  }

  protected closeCropModal(): void {
    const url = this.cropImageUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.cropImageUrl.set(null);
    this.cropModalOpen.set(false);
  }

  protected onProfilePhotoCropped(file: File): void {
    this.profileStore.uploadProfilePhoto(file);
    this.closeCropModal();
  }

  private showFileValidationErrors(): void {
    const errs = this.fileControl.errors;
    if (!errs) {
      return;
    }

    const parts: string[] = [];
    if (errs[FILE_VALIDATION_ERRORS.fileSize]) {
      parts.push(`File must be at most ${this.maxAvatarSizeMb} MB.`);
    }
    if (errs[FILE_VALIDATION_ERRORS.fileType]) {
      parts.push(
        `Invalid file type. Allowed formats: ${USER_PROFILE.AVATAR_ALLOWED_FORMATS_LABEL}.`,
      );
    }

    if (parts.length > 0) {
      this.toastr.error(parts.join(' '));
    }
  }

  protected triggerPhotoInput(input: HTMLInputElement): void {
    input.click();
  }

  protected openDeletePhotoModal(): void {
    if (!this.profileStore.hasProfilePhoto()) {
      return;
    }
    this.deletePhotoModalOpen.set(true);
  }

  protected closeDeletePhotoModal(): void {
    this.deletePhotoModalOpen.set(false);
  }

  protected confirmDeletePhoto(): void {
    if (!this.profileStore.hasProfilePhoto()) {
      return;
    }
    this.profileStore.deleteProfilePhoto();
    this.closeDeletePhotoModal();
  }
}
