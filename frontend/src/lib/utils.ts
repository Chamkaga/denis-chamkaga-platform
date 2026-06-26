export function formatDate(date: string | Date, locale: 'en' | 'sw' = 'en'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'sw' ? 'sw-TZ' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
