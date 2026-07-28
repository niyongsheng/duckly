import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from "date-fns";

export function formatDate(isoString: string): string {
  return format(parseISO(isoString), "PPP");
}

export function formatTime(isoString: string): string {
  return format(parseISO(isoString), "HH:mm");
}

export function formatRelative(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
}

export function isOverdue(isoString: string): boolean {
  return isPast(parseISO(isoString));
}

export function isDueToday(isoString: string): boolean {
  return isToday(parseISO(isoString));
}

export function isDueTomorrow(isoString: string): boolean {
  return isTomorrow(parseISO(isoString));
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}
