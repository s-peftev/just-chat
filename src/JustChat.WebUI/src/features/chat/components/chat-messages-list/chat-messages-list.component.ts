import {
  Component,
  ElementRef,
  input,
  output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Message } from '../../../../dto/chat/message.dto';
import { UserProfileDetails } from '../../../../dto/profile/user-profile-details.dto';
import { showIncomingAvatarForMessageAt } from '../../utils/show-incoming-avatar-for-message';
import { ChatMessageItemComponent } from '../chat-message-item/chat-message-item.component';

@Component({
  selector: 'app-chat-messages-list',
  imports: [NgFor, NgIf, ChatMessageItemComponent],
  templateUrl: './chat-messages-list.component.html',
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col',
  },
})
export class ChatMessagesListComponent {
  messages = input.required<Message[]>();
  ownEmail = input<string>('');
  showScrollToBottom = input(false);

  scrolled = output<Event>();
  scrollToLatestClick = output<void>();
  senderAvatarEnter = output<{ event: MouseEvent; sender: UserProfileDetails }>();
  senderAvatarLeave = output<void>();

  @ViewChild('scrollContainer', { read: ElementRef })
  scrollContainer!: ElementRef<HTMLElement>;

  @ViewChildren(ChatMessageItemComponent, { read: ElementRef })
  messageItemRefs!: QueryList<ElementRef<HTMLElement>>;

  protected showIncomingAvatarAt(index: number): boolean {
    return showIncomingAvatarForMessageAt(this.messages(), index, this.ownEmail());
  }
}
