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
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">分类</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {categories.length} 个分类</p>

      {categories.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          还没有分类。
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--accent)]"
            >
              <div>
                <p className="font-semibold group-hover:text-[var(--accent)]">{category.name}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{category._count.posts} 篇文章</p>
              </div>
              <span className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
