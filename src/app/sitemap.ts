import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/settings";
import { publishedPostWhere } from "@/lib/visibility";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");

  const [posts, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: publishedPostWhere(),
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.tag.findMany({ select: { slug: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/archive`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/tags`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticEntries,
    ...posts.map((post) => ({
      url: `${base}/posts/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...categories.map((category) => ({
      url: `${base}/categories/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...tags.map((tag) => ({
      url: `${base}/tags/${tag.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
