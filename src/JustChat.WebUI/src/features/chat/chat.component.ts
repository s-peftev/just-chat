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

/** `emoji-click` from emoji-picker-element (detail.unicode). */
type EmojiPickerClickEvent = Event & { detail: { unicode?: string } };

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
  providers: [ChatScrollService],
})
export class ChatComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(ChatMessagesListComponent) private messagesList?: ChatMessagesListComponent;
  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLTextAreaElement>;

  private readonly messageInputMinHeightPx = 48;
  private readonly messageInputMaxHeightPx = 128;

  public profileStore = inject(ProfileStore);
  public chatStore = inject(ChatStore);
  protected readonly chatScroll = inject(ChatScrollService);
  /** First + last name when either is set (for labels under / after email). */
  protected readonly userDisplayName = userDisplayNameFn;
  public inputedMessage = "";

  /** Fixed popover for incoming message avatar (escapes overflow; positioned from cursor). */
  protected avatarTooltipSender: UserProfileDetails | null = null;
  protected senderTooltipLeftPx = 0;
  protected senderTooltipTopPx = 0;
  private senderTooltipHideTimer: ReturnType<typeof setTimeout> | null = null;

  /** Emoji picker popover (same hover + delay pattern as sender avatar). */
  protected emojiTooltipVisible = false;
  protected emojiTooltipLeftPx = 0;
  protected emojiTooltipTopPx = 0;
  private emojiTooltipHideTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly floatTooltipPad = 8;
  private readonly floatTooltipCursorOff = 12;
  /** Rough size for first clamp pass; keeps popover inside the viewport. */
  private readonly senderTooltipEstW = 300;
  private readonly senderTooltipEstH = 260;
  private readonly emojiTooltipEstW = 380;
  private readonly emojiTooltipEstH = 440;

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
    this.clearSenderTooltipHideTimer();
    this.clearEmojiTooltipHideTimer();
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

  protected onSenderAvatarEnter(event: MouseEvent, sender: UserProfileDetails): void {
    this.clearSenderTooltipHideTimer();
    this.avatarTooltipSender = sender;
    this.applySenderTooltipPosition(event);
  }

  protected onSenderAvatarLeave(): void {
    this.senderTooltipHideTimer = setTimeout(() => {
      this.avatarTooltipSender = null;
      this.senderTooltipHideTimer = null;
    }, 180);
  }

  protected onSenderTooltipPopoverEnter(): void {
    this.clearSenderTooltipHideTimer();
  }

  protected onSenderTooltipPopoverLeave(): void {
    this.avatarTooltipSender = null;
  }

  protected onEmojiTriggerEnter(event: MouseEvent): void {
    this.clearEmojiTooltipHideTimer();
    this.emojiTooltipVisible = true;
    this.applyEmojiTooltipPosition(event);
  }

  protected onEmojiTriggerLeave(): void {
    this.emojiTooltipHideTimer = setTimeout(() => {
      this.emojiTooltipVisible = false;
      this.emojiTooltipHideTimer = null;
    }, 180);
  }

  protected onEmojiTooltipPopoverEnter(): void {
    this.clearEmojiTooltipHideTimer();
  }

  protected onEmojiTooltipPopoverLeave(): void {
    this.emojiTooltipVisible = false;
  }

  private clearSenderTooltipHideTimer(): void {
    if (this.senderTooltipHideTimer !== null) {
      clearTimeout(this.senderTooltipHideTimer);
      this.senderTooltipHideTimer = null;
    }
  }

  private clearEmojiTooltipHideTimer(): void {
    if (this.emojiTooltipHideTimer !== null) {
      clearTimeout(this.emojiTooltipHideTimer);
      this.emojiTooltipHideTimer = null;
    }
  }

  private applySenderTooltipPosition(event: MouseEvent): void {
    const { left, top } = this.positionFloatNearCursor(
      event,
      this.senderTooltipEstW,
      this.senderTooltipEstH,
    );
    this.senderTooltipLeftPx = left;
    this.senderTooltipTopPx = top;
  }

  private applyEmojiTooltipPosition(event: MouseEvent): void {
    const { left, top } = this.positionFloatNearCursor(
      event,
      this.emojiTooltipEstW,
      this.emojiTooltipEstH,
    );
    this.emojiTooltipLeftPx = left;
    this.emojiTooltipTopPx = top;
  }

  /** Above and to the right of the cursor; clamped to the window so nothing is clipped. */
  private positionFloatNearCursor(
    event: MouseEvent,
    estW: number,
    estH: number,
  ): { left: number; top: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = event.clientX;
    const cy = event.clientY;
    const off = this.floatTooltipCursorOff;
    const pad = this.floatTooltipPad;

    let left = cx + off;
    let top = cy - off - estH;

    if (top < pad) {
      top = cy + off;
      if (top + estH > vh - pad) {
        top = Math.max(pad, vh - estH - pad);
      }
    } else if (top + estH > vh - pad) {
      top = Math.max(pad, vh - estH - pad);
    }

    left = Math.min(left, vw - estW - pad);
    left = Math.max(pad, left);

    return { left, top };
  }

  public sendMessage(): void {
    this.chatStore.sendMessage(this.inputedMessage);
    this.inputedMessage = "";
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        const el = this.messageInput?.nativeElement;
        if (el) {
          el.style.height = `${this.messageInputMinHeightPx}px`;
        }
        this.adjustMessageInputHeight();
      });
    });
  }

  protected adjustMessageInputHeight(): void {
    const el = this.messageInput?.nativeElement;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    const h = Math.min(
      Math.max(el.scrollHeight, this.messageInputMinHeightPx),
      this.messageInputMaxHeightPx,
    );
    el.style.height = `${h}px`;
  }

  protected onMessageInputKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.isComposing) {
      return;
    }
    if (event.shiftKey) {
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const el = this.messageInput?.nativeElement;
      if (!el) {
        return;
      }
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const v = this.inputedMessage;
      this.inputedMessage = `${v.slice(0, start)}\n${v.slice(end)}`;
      queueMicrotask(() => {
        const pos = start + 1;
        el.selectionStart = pos;
        el.selectionEnd = pos;
        this.adjustMessageInputHeight();
      });
      return;
    }
    event.preventDefault();
    this.sendMessage();
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

  public onEmojiClick(event: EmojiPickerClickEvent): void {
    const emoji = event.detail.unicode;
    if (emoji) {
      this.inputedMessage += emoji;
    }
  }
}
