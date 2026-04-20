export type UserInitialsSource = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

/** Same rules as profile avatar initials: first + last, else single name, else first email character. */
export function userInitialsFromDetails(user: UserInitialsSource): string {
  const f = user.firstName?.trim();
  const l = user.lastName?.trim();
  const a = f?.[0];
  const b = l?.[0];
  if (a && b) {
    return `${a}${b}`.toUpperCase();
  }
  if (a) {
    return a.toUpperCase();
  }
  if (b) {
    return b.toUpperCase();
  }
  const email = user.email?.trim();
  return email ? email[0]!.toUpperCase() : '?';
}

export function hasProfilePhotoUrl(url: string | null | undefined): boolean {
  return url != null && url.trim() !== '';
}
