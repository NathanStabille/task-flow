const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
});

const dateOnlyFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

export function formatShortDate(value: string): string {
  return shortDateFormatter.format(new Date(value)).replace('.', '');
}

export function formatDateOnly(value: string): string {
  return dateOnlyFormatter.format(new Date(value)).replace('.', '');
}

export function isDateOverdue(value: string): boolean {
  const dueDate = new Date(value);
  const now = new Date();
  const dueDay = Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return dueDay < today;
}

export function formatToday(): string {
  const formatted = longDateFormatter.format(new Date());
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatRelativeTime(value: string): string {
  const elapsedSeconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const elapsedMinutes = Math.round(elapsedSeconds / 60);
  const elapsedHours = Math.round(elapsedMinutes / 60);
  const elapsedDays = Math.round(elapsedHours / 24);

  if (Math.abs(elapsedMinutes) < 1) return 'agora';
  if (Math.abs(elapsedMinutes) < 60) return relativeTimeFormatter.format(elapsedMinutes, 'minute');
  if (Math.abs(elapsedHours) < 24) return relativeTimeFormatter.format(elapsedHours, 'hour');
  return relativeTimeFormatter.format(elapsedDays, 'day');
}
