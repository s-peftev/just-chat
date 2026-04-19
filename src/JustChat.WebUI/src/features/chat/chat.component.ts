import { AfterViewInit, Component, effect, ElementRef, HostListener, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatStore } from './store/chat.store';
import { environment } from '../../environments/environment';
import { ProfileStore } from '../profile/store/profile.store';
import { MessageSentiment } from '../../core/enums/message-sentiment.enum';

@Component({
  selector: 'app-chat',
  providers: [ChatStore],
  imports: [
    NgFor,
    NgIf,
    NgClass,
    FormsModule,
    DatePipe
  ],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements AfterViewInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLElement>;
  @ViewChildren('messageItem') private messageItems!: QueryList<ElementRef<HTMLElement>>;
  
  public profileStore = inject(ProfileStore);
  public chatStore = inject(ChatStore);
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

  constructor() {
    effect(() => {
      const messages = this.chatStore.chatMessages().items;
      const lastMessage = messages[messages.length - 1];
      const lastSignature = lastMessage ? this.getMessageSignature(lastMessage) : null;
      const isLastChanged = !!lastSignature && lastSignature !== this.lastMessageSignature;
      const isInitial = !this.hasInitialScrolled && messages.length > 0;
      const shouldForce = this.pendingForceScroll && messages.length > 0;

      if (isInitial || shouldForce) {
        this.scrollToBottom('auto');
        this.hasInitialScrolled = true;
        this.pendingForceScroll = false;
      } else if (isLastChanged) {
        const isMyLastMessage = this.isMyMessage(lastMessage.sender.userId);
        if (this.isNearBottom || isMyLastMessage) {
          this.scrollToBottom('smooth');
        }
      }

      this.lastMessageSignature = lastSignature;
      this.scheduleScrollStateUpdate();
    });
  }

  public ngAfterViewInit(): void {
    if (this.shouldForceScrollOnLoad()) {
      this.pendingForceScroll = true;
      this.clearForceScrollOnLoadFlag();
    }
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

    requestAnimationFrame(() => {
      element.scrollTo({ top: element.scrollHeight, behavior });
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
