import prisma from "@/lib/prisma";
import { getSiteSettings, getSiteUrl } from "@/lib/settings";
import { publishedPostWhere } from "@/lib/visibility";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = getSiteUrl().replace(/\/$/, "");
  const [settings, posts] = await Promise.all([
    getSiteSettings(),
    prisma.post.findMany({
      where: publishedPostWhere(),
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: { category: true },
    }),
  ]);

  const items = posts
    .map((post) => {
      const url = `${base}/posts/${post.slug}`;
      const pubDate = post.publishedAt!.toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(post.summary)}</description>
      <pubDate>${pubDate}</pubDate>
${post.category ? `      <category>${escapeXml(post.category.name)}</category>\n` : ""}    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(settings.siteTitle)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(settings.siteDescription)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
