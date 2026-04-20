import {
  AfterViewInit,
  Component,
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

const CHAT_SCROLL_TOP_STORAGE_KEY = 'chat:scrollTop';

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
    DatePipe
  ],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLElement>;
  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLInputElement>;
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

    queueMicrotask(() => this.messageInput?.nativeElement.focus());
  }

  protected userInitials(user: UserProfileDetails): string {
    return userInitialsFromDetails(user);
  }

  protected hasPhotoUrl(url: string | null | undefined): boolean {
    return hasProfilePhotoUrl(url);
  }

  public sendMessage(): void {
    this.chatStore.sendMessage(this.inputedMessage);
    this.inputedMessage = "";
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
