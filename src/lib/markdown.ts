import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

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
 * 使用 github-slugger（rehype-slug 内部同款实现），保证锚点与渲染结果一致。
 * 跳过代码块内部的内容。
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
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

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = stripInlineMarkdown(match[2]);
    if (!text) continue;

    // h1 也交给 slugger，保持与整篇文档的标题编号一致
    const id = slugger.slug(text);
    if (level >= 2 && level <= 4) {
      items.push({ id, text, level });
    }
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
