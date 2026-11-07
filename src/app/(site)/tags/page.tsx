import type { Metadata } from "next";
import Link from "next/link";
import { POST_STATUS } from "@/lib/constants";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览全部文章",
  alternates: { canonical: "/tags" },
};

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: { where: { status: POST_STATUS.PUBLISHED } } } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">标签</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {tags.length} 个标签</p>

      {tags.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          还没有标签。
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <span>#{tag.name}</span>
              <span className="text-xs text-[var(--muted)]">{tag._count.posts}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
