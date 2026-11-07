import type { Metadata } from "next";
import Link from "next/link";
import { POST_STATUS } from "@/lib/constants";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "分类",
  description: "按分类浏览全部文章",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: { where: { status: POST_STATUS.PUBLISHED } } } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-10 sm:py-14">
      <p className="font-pixel text-[8px] leading-none text-[var(--accent)]">CATEGORIES</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">分类</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {categories.length} 个分类</p>

      <div className="mt-8">
        {categories.length === 0 ? (
          <p className="border-2 border-dashed border-[var(--border)] px-6 py-12 text-center font-pixel text-[10px] text-[var(--muted)]">
            NO CATEGORIES
          </p>
        ) : (
          categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex items-baseline justify-between gap-4 border-b-2 border-dashed border-[var(--border)] py-4"
            >
              <span className="pixel-link px-1 text-lg font-semibold">{category.name}</span>
              <span className="shrink-0 font-pixel text-[9px] leading-none text-[var(--muted)]">
                {String(category._count.posts).padStart(2, "0")} POSTS
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
