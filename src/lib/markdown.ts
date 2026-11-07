export type TocItem = {
  id: string;
  text: string;
  level: number;
};

/**
 * 生成与 rehype-slug（github-slugger）一致的标题 id。
 */
export function slugifyHeading(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

function createSlugger() {
  const used = new Map<string, number>();
  return (text: string) => {
    const base = slugifyHeading(text) || "section";
    const count = used.get(base);
    if (count === undefined) {
      used.set(base, 0);
      return base;
    }
    const next = count + 1;
    used.set(base, next);
    return `${base}-${next}`;
  };
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/~~([^~]*)~~/g, "$1")
    .trim();
}

/**
 * 从 Markdown 正文中提取 h2/h3/h4 标题，生成目录。
 * 跳过代码块内部的内容。
 */
export function extractToc(markdown: string): TocItem[] {
  const slug = createSlugger();
  const items: TocItem[] = [];
  const lines = markdown.split("\n");
  let inFence = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = stripInlineMarkdown(match[2]);
    if (!text) continue;

    items.push({ id: slug(text), text, level });
  }

  return items;
}

export function readingTime(markdown: string): number {
  const chinese = (markdown.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = markdown
    .replace(/[\u4e00-\u9fa5]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.ceil(chinese / 400 + words / 200);
  return Math.max(1, minutes);
}

export function excerptFromMarkdown(markdown: string, max = 160): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}
