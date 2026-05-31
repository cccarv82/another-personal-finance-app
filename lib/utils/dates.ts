import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: ptBR });
}

export function formatDateRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "dd 'de' MMM", { locale: ptBR });
}

export function formatDateFull(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

export function getCurrentPeriod(): string {
  return format(new Date(), "yyyy-MM");
}

export function getPeriodLabel(period: string): string {
  const [year, month] = period.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(d, "MMMM 'de' yyyy", { locale: ptBR });
}

export function getMonthRange(period?: string): { start: string; end: string } {
  let year: number, month: number;
  if (period) {
    // Parse manually to avoid UTC-vs-local timezone shift from new Date("YYYY-MM-DD")
    const [y, m] = period.split("-").map(Number);
    year = y;
    month = m - 1; // 0-indexed
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }
  const start = format(new Date(year, month, 1), "yyyy-MM-dd");
  const end = format(new Date(year, month + 1, 0), "yyyy-MM-dd");
  return { start, end };
}

export function getLast90DaysRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 90);
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
}
