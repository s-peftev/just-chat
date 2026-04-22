import { Injectable, inject } from '@angular/core';
import { ChatStore } from '../store/chat.store';

/** `emoji-click` from emoji-picker-element (detail.unicode). */
type EmojiPickerClickEvent = Event & { detail: { unicode?: string } };

@Injectable()
export class ChatMessageComposerService {
  private readonly chatStore = inject(ChatStore);

  private readonly messageInputMinHeightPx = 48;
  private readonly messageInputMaxHeightPx = 128;

  inputedMessage = '';

  onEmojiClick(event: EmojiPickerClickEvent): void {
    const emoji = event.detail.unicode;
    if (emoji) {
      this.inputedMessage += emoji;
    }
  }

  sendMessage(getTextarea: () => HTMLTextAreaElement | undefined): void {
    this.chatStore.sendMessage(this.inputedMessage);
    this.inputedMessage = '';
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        const el = getTextarea();
        if (el) {
          el.style.height = `${this.messageInputMinHeightPx}px`;
        }
        this.adjustMessageInputHeight(getTextarea);
      });
    });
  }

  adjustMessageInputHeight(getTextarea: () => HTMLTextAreaElement | undefined): void {
    const el = getTextarea();
    if (!el) {
      return;
    }
    el.style.height = 'auto';
    const h = Math.min(
      Math.max(el.scrollHeight, this.messageInputMinHeightPx),
      this.messageInputMaxHeightPx,
    );
    el.style.height = `${h}px`;
  }

  onMessageInputKeydown(
    event: KeyboardEvent,
    getTextarea: () => HTMLTextAreaElement | undefined,
  ): void {
    if (event.key !== 'Enter' || event.isComposing) {
      return;
    }
    if (event.shiftKey) {
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const el = getTextarea();
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
        this.adjustMessageInputHeight(getTextarea);
      });
      return;
    }
    event.preventDefault();
    this.sendMessage(getTextarea);
  }
}
