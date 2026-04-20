/** Trimmed "FirstName LastName", or a single name if only one is set; empty string if neither. */
export function userDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const f = user.firstName?.trim() ?? '';
  const l = user.lastName?.trim() ?? '';
  if (f && l) {
    return `${f} ${l}`;
  }
  if (f) {
    return f;
  }
  if (l) {
    return l;
  }
  return '';
}
