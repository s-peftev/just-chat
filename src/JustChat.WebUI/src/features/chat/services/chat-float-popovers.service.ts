import { Injectable } from '@angular/core';
import { UserProfileDetails } from '../../../dto/profile/user-profile-details.dto';

@Injectable()
export class ChatFloatPopoversService {
  private readonly floatTooltipPad = 8;
  private readonly floatTooltipCursorOff = 12;
  /** Rough size for first clamp pass; keeps popover inside the viewport. */
  private readonly senderTooltipEstW = 300;
  private readonly senderTooltipEstH = 260;
  private readonly emojiTooltipEstW = 380;
  private readonly emojiTooltipEstH = 440;

  /** Fixed popover for incoming message avatar (escapes overflow; positioned from cursor). */
  avatarTooltipSender: UserProfileDetails | null = null;
  senderTooltipLeftPx = 0;
  senderTooltipTopPx = 0;
  private senderTooltipHideTimer: ReturnType<typeof setTimeout> | null = null;

  /** Emoji picker popover (same hover + delay pattern as sender avatar). */
  emojiTooltipVisible = false;
  emojiTooltipLeftPx = 0;
  emojiTooltipTopPx = 0;
  private emojiTooltipHideTimer: ReturnType<typeof setTimeout> | null = null;

  onSenderAvatarEnter(event: MouseEvent, sender: UserProfileDetails): void {
    this.clearSenderTooltipHideTimer();
    this.avatarTooltipSender = sender;
    this.applySenderTooltipPosition(event);
  }

  onSenderAvatarLeave(): void {
    this.senderTooltipHideTimer = setTimeout(() => {
      this.avatarTooltipSender = null;
      this.senderTooltipHideTimer = null;
    }, 180);
  }

  onSenderTooltipPopoverEnter(): void {
    this.clearSenderTooltipHideTimer();
  }

  onSenderTooltipPopoverLeave(): void {
    this.avatarTooltipSender = null;
  }

  onEmojiTriggerEnter(event: MouseEvent): void {
    this.clearEmojiTooltipHideTimer();
    this.emojiTooltipVisible = true;
    this.applyEmojiTooltipPosition(event);
  }

  onEmojiTriggerLeave(): void {
    this.emojiTooltipHideTimer = setTimeout(() => {
      this.emojiTooltipVisible = false;
      this.emojiTooltipHideTimer = null;
    }, 180);
  }

  onEmojiTooltipPopoverEnter(): void {
    this.clearEmojiTooltipHideTimer();
  }

  onEmojiTooltipPopoverLeave(): void {
    this.emojiTooltipVisible = false;
  }

  dispose(): void {
    this.clearSenderTooltipHideTimer();
    this.clearEmojiTooltipHideTimer();
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
}
