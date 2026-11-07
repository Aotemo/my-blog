const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Shanghai",
});

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "未发布";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "未知日期";
  return dateFormatter.format(value).replace(/\//g, "-");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatDate(value)} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function formatNumber(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return String(value);
}

export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
