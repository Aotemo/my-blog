import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "分类管理",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">分类</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">删除分类后，其下文章会自动变为未分类</p>
      </div>

      <TaxonomyManager
        kind="分类"
        endpoint="/api/categories"
        items={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category._count.posts,
        }))}
      />
    </div>
  );
}
