// Pure helper for the profile feature (easy to unit test without Angular).

/** Derive up-to-two-letter initials from a full name, e.g. "Alex Morgan" -> "AM". */
export function computeInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return (parts[0][0] + (parts.at(-1)?.[0] ?? '')).toUpperCase();
}
