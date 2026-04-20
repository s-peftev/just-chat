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
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { emailLocalPart as emailLocalPartFn } from '../../core/utils/email-local-part';
import { userDisplayName as userDisplayNameFn } from '../../core/utils/user-display-name';
import { hasProfilePhotoUrl, userInitialsFromDetails } from '../../core/utils/user-initials';
import { UserProfileDetails } from '../../dto/profile/user-profile-details.dto';
import { ChatStore } from './store/chat.store';
import { environment } from '../../environments/environment';
import { ProfileStore } from '../profile/store/profile.store';
import { MessageSentiment } from '../../core/enums/message-sentiment.enum';
import { FloatTooltipComponent } from '../../shared/components/float-tooltip/float-tooltip.component';

const CHAT_SCROLL_TOP_STORAGE_KEY = 'chat:scrollTop';

/** `emoji-click` from emoji-picker-element (detail.unicode). */
type EmojiPickerClickEvent = Event & { detail: { unicode?: string } };

@Component({
  selector: 'app-chat',
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col',
  },
  imports: [
    NgFor,
    NgIf,
    NgClass,
    FormsModule,
    DatePipe,
    FloatTooltipComponent,
  ],
  templateUrl: './chat.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLElement>;
  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLTextAreaElement>;

  private readonly messageInputMinHeightPx = 48;
  private readonly messageInputMaxHeightPx = 128;
  @ViewChildren('messageItem') private messageItems!: QueryList<ElementRef<HTMLElement>>;
  
  public profileStore = inject(ProfileStore);
  public chatStore = inject(ChatStore);
  /** Chat UI: show only the local part of email (before `@`). */
  protected readonly emailLocalPart = emailLocalPartFn;
  /** First + last name when either is set (for labels under / after email). */
  protected readonly userDisplayName = userDisplayNameFn;
  public messageSentiments = MessageSentiment;
  public inputedMessage = "";
  public get showScrollToBottom(): boolean {
    return !this.isNearBottom;
  }

  private readonly autoScrollThresholdMessages = environment.autoScrollThresholdMessages;
  private hasInitialScrolled = false;
  private isNearBottom = true;
  private lastMessageSignature: string | null = null;
  private pendingForceScroll = false;
  /** Set from sessionStorage on init; restored once messages + view are ready (not the same as F5 "force bottom"). */
  private scrollTopToRestore: number | null = null;

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
      const lastMessage = messages[messages.length - 1];
      const lastSignature = lastMessage ? this.getMessageSignature(lastMessage) : null;
      const isLastChanged = !!lastSignature && lastSignature !== this.lastMessageSignature;
      const isInitial = !this.hasInitialScrolled && messages.length > 0;
      const shouldForce = this.pendingForceScroll && messages.length > 0;

      if (messages.length > 0) {
        if (shouldForce) {
          this.scrollToBottom('auto');
          this.hasInitialScrolled = true;
          this.pendingForceScroll = false;
        } else if (this.scrollTopToRestore !== null && this.scrollContainer?.nativeElement) {
          const top = this.scrollTopToRestore;
          this.scrollTopToRestore = null;
          this.applyRestoredScrollTop(top);
          this.hasInitialScrolled = true;
        } else if (isInitial && this.scrollTopToRestore === null) {
          this.scrollToBottom('auto');
          this.hasInitialScrolled = true;
        } else if (isLastChanged) {
          const isMyLastMessage = this.isMyMessage(lastMessage.sender.userId);
          if (this.isNearBottom || isMyLastMessage) {
            this.scrollToBottom('smooth');
          }
        }
      }

      this.lastMessageSignature = lastSignature;
      this.scheduleScrollStateUpdate();
    });
  }

  public ngOnInit(): void {
    try {
      const raw = sessionStorage.getItem(CHAT_SCROLL_TOP_STORAGE_KEY);
      if (raw === null) {
        return;
      }
      sessionStorage.removeItem(CHAT_SCROLL_TOP_STORAGE_KEY);
      const n = Number(raw);
      if (!Number.isNaN(n) && n >= 0) {
        this.scrollTopToRestore = n;
      }
    } catch {
      // private mode / quota
    }
  }

  public ngOnDestroy(): void {
    this.clearSenderTooltipHideTimer();
    this.clearEmojiTooltipHideTimer();
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) {
        sessionStorage.setItem(CHAT_SCROLL_TOP_STORAGE_KEY, String(el.scrollTop));
      }
    } catch {
      // ignore
    }
  }

  public ngAfterViewInit(): void {
    if (this.shouldForceScrollOnLoad()) {
      this.pendingForceScroll = true;
      this.clearForceScrollOnLoadFlag();
    }

    if (
      this.scrollTopToRestore !== null &&
      this.scrollContainer?.nativeElement &&
      !this.hasInitialScrolled &&
      !this.pendingForceScroll &&
      this.chatStore.chatMessages().items.length > 0
    ) {
      const top = this.scrollTopToRestore;
      this.scrollTopToRestore = null;
      this.applyRestoredScrollTop(top);
      this.hasInitialScrolled = true;
    }

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

  /**
   * Incoming messages: show avatar only on the last message in a run from the same sender
   * (next message is missing or from someone else).
   */
  protected showIncomingAvatarForMessageAt(index: number): boolean {
    const items = this.chatStore.chatMessages().items;
    const cur = items[index];
    if (!cur || cur.sender.email === this.profileStore.email()) {
      return false;
    }
    const next = items[index + 1];
    if (!next) {
      return true;
    }
    return next.sender.userId !== cur.sender.userId;
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

  public onScroll(): void {
    const element = this.scrollContainer.nativeElement;

    if (element.scrollTop === 0 && !this.chatStore.isBusy()) {
      const previousHeight = element.scrollHeight;
      const previousTop = element.scrollTop;

      this.chatStore.loadPreviousMessages().subscribe({
        next: () => {
          requestAnimationFrame(() => {
            const newHeight = element.scrollHeight;
            element.scrollTop = newHeight - previousHeight + previousTop;
            this.updateScrollState();
          });
        }
      });
    }

    this.updateScrollState();
  }

  public scrollToLatest(): void {
    this.scrollToBottom('smooth');
  }

  @HostListener('window:keydown', ['$event'])
  public onWindowKeyDown(event: KeyboardEvent): void {
    if (event.key === 'F5') {
      this.setForceScrollOnLoadFlag();
      this.pendingForceScroll = true;
      this.scrollToBottom('auto');
    }
  }

  public onEmojiClick(event: EmojiPickerClickEvent): void {
    const emoji = event.detail.unicode;
    if (emoji) {
      this.inputedMessage += emoji;
    }
  }

  private scrollToBottom(behavior: ScrollBehavior): void {
    const element = this.scrollContainer?.nativeElement;
    if (!element) {
      return;
    }

    const run = (): void => {
      element.scrollTo({ top: element.scrollHeight, behavior });
    };

    if (behavior === 'auto') {
      requestAnimationFrame(() => {
        requestAnimationFrame(run);
      });
    } else {
      requestAnimationFrame(run);
    }
  }

  private applyRestoredScrollTop(top: number): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = this.scrollContainer?.nativeElement;
        if (!el) {
          return;
        }
        const max = Math.max(0, el.scrollHeight - el.clientHeight);
        el.scrollTop = Math.max(0, Math.min(top, max));
        this.updateScrollState();
      });
    });
  }

  private scheduleScrollStateUpdate(): void {
    if (!this.scrollContainer) {
      return;
    }

    requestAnimationFrame(() => this.updateScrollState());
  }

  private updateScrollState(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container || !this.messageItems) {
      this.isNearBottom = true;
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const bottom = containerRect.bottom;
    const items = this.messageItems.toArray();

    if (items.length === 0) {
      this.isNearBottom = true;
      return;
    }

    let lastVisibleIndex = -1;
    for (let i = items.length - 1; i >= 0; i -= 1) {
      const rect = items[i].nativeElement.getBoundingClientRect();
      if (rect.top < bottom) {
        lastVisibleIndex = i;
        break;
      }
    }

    const messagesBelow = lastVisibleIndex === -1 ? items.length : items.length - 1 - lastVisibleIndex;
    this.isNearBottom = messagesBelow <= this.autoScrollThresholdMessages;
  }

  private getMessageSignature(message: { text: string; createdAt: string; sender: { userId: string } }): string {
    return `${message.createdAt}|${message.sender.userId}|${message.text}`;
  }

  private shouldForceScrollOnLoad(): boolean {
    try {
      return sessionStorage.getItem('chat:scrollToBottomOnLoad') === '1';
    } catch {
      return false;
    }
  }

  private setForceScrollOnLoadFlag(): void {
    try {
      sessionStorage.setItem('chat:scrollToBottomOnLoad', '1');
    } catch {
      // Ignore storage errors (private mode).
    }
  }

  private clearForceScrollOnLoadFlag(): void {
    try {
      sessionStorage.removeItem('chat:scrollToBottomOnLoad');
    } catch {
      // Ignore storage errors (private mode).
    }
  }

  private isMyMessage(messageSenderId: string): boolean {
    return this.profileStore.userId() === messageSenderId;
  }
}
