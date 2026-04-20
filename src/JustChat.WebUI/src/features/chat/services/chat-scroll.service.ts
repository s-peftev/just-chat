import { Injectable, inject } from '@angular/core';
import { Message } from '../../../dto/chat/message.dto';
import { environment } from '../../../environments/environment';
import { ProfileStore } from '../../profile/store/profile.store';
import { ChatStore } from '../store/chat.store';
import { ChatMessagesListComponent } from '../components/chat-messages-list/chat-messages-list.component';

const CHAT_SCROLL_TOP_STORAGE_KEY = 'chat:scrollTop';
const CHAT_SCROLL_TO_BOTTOM_ON_LOAD_KEY = 'chat:scrollToBottomOnLoad';

@Injectable()
export class ChatScrollService {
  private readonly chatStore = inject(ChatStore);
  private readonly profileStore = inject(ProfileStore);
  private readonly autoScrollThresholdMessages = environment.autoScrollThresholdMessages;

  private hasInitialScrolled = false;
  private isNearBottom = true;
  private lastMessageSignature: string | null = null;
  private pendingForceScroll = false;
  private scrollTopToRestore: number | null = null;

  get showScrollToBottom(): boolean {
    return !this.isNearBottom;
  }

  consumeScrollTopRestoreFromSessionOnInit(): void {
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

  persistScrollTopOnDestroy(list: ChatMessagesListComponent | undefined): void {
    try {
      const el = list?.scrollContainer?.nativeElement;
      if (el) {
        sessionStorage.setItem(CHAT_SCROLL_TOP_STORAGE_KEY, String(el.scrollTop));
      }
    } catch {
      // ignore
    }
  }

  runAfterViewInit(list: ChatMessagesListComponent | undefined, messagesLength: number): void {
    if (this.shouldForceScrollOnLoad()) {
      this.pendingForceScroll = true;
      this.clearForceScrollOnLoadFlag();
    }

    if (
      this.scrollTopToRestore !== null &&
      list?.scrollContainer?.nativeElement &&
      !this.hasInitialScrolled &&
      !this.pendingForceScroll &&
      messagesLength > 0
    ) {
      const top = this.scrollTopToRestore;
      this.scrollTopToRestore = null;
      this.applyRestoredScrollTop(list, top);
      this.hasInitialScrolled = true;
    }
  }

  syncFromMessagesSignal(list: ChatMessagesListComponent | undefined, messages: Message[]): void {
    const lastMessage = messages[messages.length - 1];
    const lastSignature = lastMessage ? this.getMessageSignature(lastMessage) : null;
    const isLastChanged = !!lastSignature && lastSignature !== this.lastMessageSignature;
    const isInitial = !this.hasInitialScrolled && messages.length > 0;
    const shouldForce = this.pendingForceScroll && messages.length > 0;

    if (messages.length > 0) {
      if (shouldForce) {
        this.scrollToBottom(list, 'auto');
        this.hasInitialScrolled = true;
        this.pendingForceScroll = false;
      } else if (this.scrollTopToRestore !== null && list?.scrollContainer?.nativeElement) {
        const top = this.scrollTopToRestore;
        this.scrollTopToRestore = null;
        this.applyRestoredScrollTop(list, top);
        this.hasInitialScrolled = true;
      } else if (isInitial && this.scrollTopToRestore === null) {
        this.scrollToBottom(list, 'auto');
        this.hasInitialScrolled = true;
      } else if (isLastChanged && lastMessage) {
        const isMyLastMessage = this.isMyMessage(lastMessage.sender.userId);
        if (this.isNearBottom || isMyLastMessage) {
          this.scrollToBottom(list, 'smooth');
        }
      }
    }

    this.lastMessageSignature = lastSignature;
    this.scheduleScrollStateUpdate(list);
  }

  onViewportScroll(list: ChatMessagesListComponent | undefined, event: Event): void {
    const element = event.currentTarget as HTMLElement;

    if (element.scrollTop === 0 && !this.chatStore.isBusy()) {
      const previousHeight = element.scrollHeight;
      const previousTop = element.scrollTop;

      this.chatStore.loadPreviousMessages().subscribe({
        next: () => {
          requestAnimationFrame(() => {
            const newHeight = element.scrollHeight;
            element.scrollTop = newHeight - previousHeight + previousTop;
            this.updateScrollState(list);
          });
        },
      });
    }

    this.updateScrollState(list);
  }

  scrollToLatest(list: ChatMessagesListComponent | undefined): void {
    this.scrollToBottom(list, 'smooth');
  }

  onF5BeforeReload(list: ChatMessagesListComponent | undefined): void {
    this.setForceScrollOnLoadFlag();
    this.pendingForceScroll = true;
    this.scrollToBottom(list, 'auto');
  }

  private scrollToBottom(list: ChatMessagesListComponent | undefined, behavior: ScrollBehavior): void {
    const element = list?.scrollContainer?.nativeElement;
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

  private applyRestoredScrollTop(list: ChatMessagesListComponent | undefined, top: number): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = list?.scrollContainer?.nativeElement;
        if (!el) {
          return;
        }
        const max = Math.max(0, el.scrollHeight - el.clientHeight);
        el.scrollTop = Math.max(0, Math.min(top, max));
        this.updateScrollState(list);
      });
    });
  }

  private scheduleScrollStateUpdate(list: ChatMessagesListComponent | undefined): void {
    if (!list?.scrollContainer) {
      return;
    }

    requestAnimationFrame(() => this.updateScrollState(list));
  }

  private updateScrollState(list: ChatMessagesListComponent | undefined): void {
    const container = list?.scrollContainer?.nativeElement;
    const rowRefs = list?.messageItemRefs;
    if (!container || !rowRefs) {
      this.isNearBottom = true;
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const bottom = containerRect.bottom;
    const items = rowRefs.toArray();

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

  private isMyMessage(messageSenderId: string): boolean {
    return this.profileStore.userId() === messageSenderId;
  }

  private shouldForceScrollOnLoad(): boolean {
    try {
      return sessionStorage.getItem(CHAT_SCROLL_TO_BOTTOM_ON_LOAD_KEY) === '1';
    } catch {
      return false;
    }
  }

  private setForceScrollOnLoadFlag(): void {
    try {
      sessionStorage.setItem(CHAT_SCROLL_TO_BOTTOM_ON_LOAD_KEY, '1');
    } catch {
      // Ignore storage errors (private mode).
    }
  }

  private clearForceScrollOnLoadFlag(): void {
    try {
      sessionStorage.removeItem(CHAT_SCROLL_TO_BOTTOM_ON_LOAD_KEY);
    } catch {
      // Ignore storage errors (private mode).
    }
  }
}
