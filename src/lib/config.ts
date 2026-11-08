/**
 * 站点时区：所有日期展示、归档分组与 datetime-local 转换都以它为准，
 * 不依赖运行服务器的本地时区。
 */
export const SITE_TIMEZONE =
  process.env.NEXT_PUBLIC_SITE_TIMEZONE?.trim() || "Asia/Shanghai";
