/**
 * Validates and normalizes a matric number to canonical format: RUN/XXX/YY/ZZZZZ
 * Accepts separators: / - space
 * Case-insensitive input
 */
export function normalizeMatricNo(input: string): string | null {
  if (!input || typeof input !== 'string') return null;

  // Remove extra whitespace and trim
  let cleaned = input.trim().toUpperCase();

  // Replace common separators with /
  cleaned = cleaned.replace(/[-\s]+/g, '/');

  // Remove consecutive slashes
  cleaned = cleaned.replace(/\/+/g, '/');

  // Validate basic structure: at least 3 parts separated by /
  const parts = cleaned.split('/');
  if (parts.length < 3) return null;

  // Validate first part is RUN
  if (parts[0] !== 'RUN') return null;

  // Validate last part is numeric (the suffix)
  const suffix = parts[parts.length - 1];
  if (!/^\d+$/.test(suffix)) return null;

  return cleaned;
}

/**
 * Extracts the numeric suffix from a matric number.
 * Example: RUN/FKI/23/15896 → "15896"
 */
export function extractMatricSuffix(matricNo: string): string {
  const parts = matricNo.split('/');
  return parts[parts.length - 1];
}

/**
 * Validates that a suffix is exactly 5 digits
 */
export function isValidSuffix(suffix: string): boolean {
  return /^\d{5}$/.test(suffix);
}

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that a name is not empty and has reasonable length
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 200;
}

/**
 * Format a date to display string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time with seconds
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for short display
 */
export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
