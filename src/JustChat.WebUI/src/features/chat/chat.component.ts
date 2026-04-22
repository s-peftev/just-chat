import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { userDisplayName as userDisplayNameFn } from '../../core/utils/user-display-name';
import { hasProfilePhotoUrl, userInitialsFromDetails } from '../../core/utils/user-initials';
import { UserProfileDetails } from '../../dto/profile/user-profile-details.dto';
import { ChatStore } from './store/chat.store';
import { ProfileStore } from '../profile/store/profile.store';
import { FloatTooltipComponent } from '../../shared/components/float-tooltip/float-tooltip.component';
import { ChatActiveUsersComponent } from './components/chat-active-users/chat-active-users.component';
import { ChatMessagesListComponent } from './components/chat-messages-list/chat-messages-list.component';
import { ChatScrollService } from './services/chat-scroll.service';
import { ChatFloatPopoversService } from './services/chat-float-popovers.service';
import { ChatMessageComposerService } from './services/chat-message-composer.service';

@Component({
  selector: 'app-chat',
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col',
  },
  imports: [
    NgIf,
    FormsModule,
    FloatTooltipComponent,
    ChatActiveUsersComponent,
    ChatMessagesListComponent,
  ],
  templateUrl: './chat.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ChatScrollService, ChatFloatPopoversService, ChatMessageComposerService],
})
export class ChatComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(ChatMessagesListComponent) private messagesList?: ChatMessagesListComponent;
  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLTextAreaElement>;

  public profileStore = inject(ProfileStore);
  public chatStore = inject(ChatStore);
  protected readonly chatScroll = inject(ChatScrollService);
  protected readonly popovers = inject(ChatFloatPopoversService);
  protected readonly composer = inject(ChatMessageComposerService);

  /** First + last name when either is set (for labels under / after email). */
  protected readonly userDisplayName = userDisplayNameFn;

  constructor() {
    effect(() => {
      const messages = this.chatStore.chatMessages().items;
      this.chatScroll.syncFromMessagesSignal(this.messagesList, messages);
    });
  }

  public ngOnInit(): void {
    this.chatScroll.consumeScrollTopRestoreFromSessionOnInit();
  }

  public ngOnDestroy(): void {
    this.popovers.dispose();
    this.chatScroll.persistScrollTopOnDestroy(this.messagesList);
  }

  public ngAfterViewInit(): void {
    this.chatScroll.runAfterViewInit(this.messagesList, this.chatStore.chatMessages().items.length);

    queueMicrotask(() => {
      this.messageInput?.nativeElement.focus();
      this.adjustMessageInputHeight();
    });
  }

  protected userInitials(user: UserProfileDetails): string {
    return userInitialsFromDetails(user);
  }

  protected hasPhotoUrl(url: string | null | undefined): boolean {
    return hasProfilePhotoUrl(url);
  }

  protected adjustMessageInputHeight(): void {
    this.composer.adjustMessageInputHeight(() => this.messageInput?.nativeElement);
  }

  public sendMessage(): void {
    this.composer.sendMessage(() => this.messageInput?.nativeElement);
  }

  protected onMessageInputKeydown(event: KeyboardEvent): void {
    this.composer.onMessageInputKeydown(event, () => this.messageInput?.nativeElement);
  }

  public onScroll(event: Event): void {
    this.chatScroll.onViewportScroll(this.messagesList, event);
  }

  public scrollToLatest(): void {
    this.chatScroll.scrollToLatest(this.messagesList);
  }

  @HostListener('window:keydown', ['$event'])
  public onWindowKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F5') {
      this.chatScroll.onF5BeforeReload(this.messagesList);
    }
  }
}
