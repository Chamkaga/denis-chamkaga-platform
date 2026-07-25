/**
 * Utility functions for date formatting, object sanitization, and string transformations.
 */

export function formatDateISO(date: Date | string | number | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined && value !== null) {
      result[key as keyof T] = value;
    }
  }
  return result;
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
