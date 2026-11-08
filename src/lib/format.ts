import { SITE_TIMEZONE } from "./config";

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
}

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

const pad = (value: number) => String(value).padStart(2, "0");

export function getZonedParts(date: Date | string, timeZone = SITE_TIMEZONE): ZonedParts {
  const parts = getPartsFormatter(timeZone).formatToParts(toDate(date));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second"),
  };
}

/** 返回 yyyy-mm-dd（站点时区） */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "未发布";
  const value = toDate(date);
  if (Number.isNaN(value.getTime())) return "未知日期";
  const { year, month, day } = getZonedParts(value);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** 返回 yyyy-mm-dd HH:mm（站点时区） */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const value = toDate(date);
  if (Number.isNaN(value.getTime())) return "-";
  const { year, month, day, hour, minute } = getZonedParts(value);
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`;
}

/** datetime-local 输入值：yyyy-mm-ddTHH:mm（站点时区） */
export function formatDateTimeLocal(date: Date | string | null | undefined): string {
  if (!date) return "";
  const value = toDate(date);
  if (Number.isNaN(value.getTime())) return "";
  const { year, month, day, hour, minute } = getZonedParts(value);
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/**
 * 把站点时区下的 datetime-local 值（yyyy-mm-ddTHH:mm）转成 UTC Date。
 * 非法日期或该时区不存在的本地时间（夏令时跳变）返回 null。
 */
export function parseDateTimeLocal(value: string, timeZone = SITE_TIMEZONE): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  const wallClock = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(wallClock);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute
  ) {
    return null;
  }

  let utc = wallClock;
  for (let i = 0; i < 2; i += 1) {
    utc = wallClock - zoneOffsetMs(new Date(utc), timeZone);
  }

  const result = new Date(utc);
  const roundTrip = getZonedParts(result, timeZone);
  if (
    roundTrip.year !== year ||
    roundTrip.month !== month ||
    roundTrip.day !== day ||
    roundTrip.hour !== hour ||
    roundTrip.minute !== minute
  ) {
    return null;
  }

  return result;
}

export function formatNumber(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return String(value);
}
