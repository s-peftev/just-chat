import { Component, input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { emailLocalPart as emailLocalPartFn } from '../../../../core/utils/email-local-part';
import { userDisplayName as userDisplayNameFn } from '../../../../core/utils/user-display-name';
import { hasProfilePhotoUrl, userInitialsFromDetails } from '../../../../core/utils/user-initials';
import { UserProfileDetails } from '../../../../dto/profile/user-profile-details.dto';

@Component({
  selector: 'app-chat-active-users',
  imports: [NgFor, NgIf],
  templateUrl: './chat-active-users.component.html',
  host: {
    class:
      'w-1/5 rounded-l-4xl border-r border-white/8 bg-black/25 backdrop-blur-md min-h-0 overflow-y-auto',
  },
})
export class ChatActiveUsersComponent {
  users = input.required<UserProfileDetails[]>();

  protected readonly emailLocalPart = emailLocalPartFn;
  protected readonly userDisplayName = userDisplayNameFn;

  protected userInitials(user: UserProfileDetails): string {
    return userInitialsFromDetails(user);
  }

  protected hasPhotoUrl(url: string | null | undefined): boolean {
    return hasProfilePhotoUrl(url);
  }
}
