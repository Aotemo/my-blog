/**
 * 纯字符串工具，不依赖 Node / Next，可在客户端与服务端共用。
 */

export function slugify(input: string): string {
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const ascii = normalized
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (ascii) return ascii;

  // 中文等非拉丁字符：使用字符编码生成稳定的 slug
  const encoded = Array.from(input.trim())
    .map((char) => (char.codePointAt(0) ?? 0).toString(36))
    .join("-");
  return `post-${encoded}`;
}

export function slugifyName(name: string): string {
  const ascii = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (ascii) return ascii;
  return `item-${Array.from(name.trim())
    .map((char) => (char.codePointAt(0) ?? 0).toString(36))
    .join("-")}`;
}
