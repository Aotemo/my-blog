import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "标签管理",
  robots: { index: false, follow: false },
};

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">标签</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">标签用于跨分类串联文章</p>
      </div>

      <TaxonomyManager
        kind="标签"
        endpoint="/api/tags"
        items={tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          count: tag._count.posts,
        }))}
      />
    </div>
  );
}
