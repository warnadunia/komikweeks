import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const WELCOME_COINS = 100;

/** 1.250.000 -> "1,3 jt" · 84.000 -> "84 rb" */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} rb`;
  return `${n}`;
}

export function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export function formatDateLong(d: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

/** "2026-11-12T12:00" (nilai input datetime-local, zona WIB) */
export function toWIBDateTimeLocal(d: Date | string): string {
  const dt = new Date(d);
  return new Date(dt.getTime() + 7 * 3600_000).toISOString().slice(0, 16);
}

export function toWIBDateInput(d: Date | string): string {
  const dt = new Date(d);
  return new Date(dt.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}

/** Parse nilai input (WIB) menjadi Date. Terima "YYYY-MM-DD" atau "YYYY-MM-DDTHH:mm". */
export function parseWIB(v: string): Date | null {
  if (!v) return null;
  const withTime = v.length === 10 ? `${v}T10:00` : v;
  const d = new Date(`${withTime}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dateRange(a: Date | string, b: Date | string): string {
  const da = new Date(a);
  const db = new Date(b);
  const sameMonth = da.getMonth() === db.getMonth();
  const fmtDay = new Intl.DateTimeFormat("id-ID", { day: "numeric" });
  const fmtMonthDay = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
  });
  const fYear = new Intl.DateTimeFormat("id-ID", { year: "numeric" });
  if (sameMonth) {
    return `${fmtDay.format(da)} – ${fmtMonthDay.format(db)} ${fYear.format(db)}`;
  }
  return `${fmtMonthDay.format(da)} – ${fmtMonthDay.format(db)} ${fYear.format(db)}`;
}
