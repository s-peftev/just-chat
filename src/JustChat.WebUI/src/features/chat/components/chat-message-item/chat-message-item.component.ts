import { Component, input, output } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { Message } from '../../../../dto/chat/message.dto';
import { UserProfileDetails } from '../../../../dto/profile/user-profile-details.dto';
import { MessageSentiment } from '../../../../core/enums/message-sentiment.enum';
import { hasProfilePhotoUrl, userInitialsFromDetails } from '../../../../core/utils/user-initials';

@Component({
  selector: 'app-chat-message-item',
  imports: [NgIf, DatePipe],
  templateUrl: './chat-message-item.component.html',
  host: {
    class: 'mb-3 flex',
    '[class.justify-end]': 'isOwnMessage()',
    '[class.justify-start]': '!isOwnMessage()',
  },
})
export class ChatMessageItemComponent {
  message = input.required<Message>();
  ownEmail = input<string>('');
  showIncomingAvatar = input(false);

  senderAvatarEnter = output<{ event: MouseEvent; sender: UserProfileDetails }>();
  senderAvatarLeave = output<void>();

  protected readonly messageSentiments = MessageSentiment;

  protected isOwnMessage(): boolean {
    return this.message().sender.email === this.ownEmail();
  }

  protected userInitials(user: UserProfileDetails): string {
    return userInitialsFromDetails(user);
  }

  protected hasPhotoUrl(url: string | null | undefined): boolean {
    return hasProfilePhotoUrl(url);
  }

  protected onAvatarEnter(event: MouseEvent): void {
    this.senderAvatarEnter.emit({ event, sender: this.message().sender });
  }
}
