/**
 * For display: the part of an address before the first `@` (domain is dropped with the `@`).
 * If there is no `@`, returns the trimmed string as-is (e.g. non-email identifiers).
 */
export function emailLocalPart(email: string | null | undefined): string {
  if (email == null) {
    return '';
  }
  const t = email.trim();
  if (!t) {
    return '';
  }
  const at = t.indexOf('@');
  if (at === -1) {
    return t;
  }
  return t.slice(0, at).trim();
}
