import { Message } from '../../../dto/chat/message.dto';

/**
 * Incoming messages: show avatar only on the last message in a run from the same sender.
 */
export function showIncomingAvatarForMessageAt(
  items: readonly Message[],
  index: number,
  ownEmail: string,
): boolean {
  const cur = items[index];
  if (!cur || cur.sender.email === ownEmail) {
    return false;
  }
  const next = items[index + 1];
  if (!next) {
    return true;
  }
  return next.sender.userId !== cur.sender.userId;
}
