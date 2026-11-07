import type { Metadata } from "next";
import Link from "next/link";
import { POST_STATUS } from "@/lib/constants";
import prisma from "@/lib/prisma";

const ASCII = /^[\x20-\x7e]+$/;

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
    <div className="mx-auto w-full max-w-[680px] px-5 py-10 sm:py-14">
      <p className="font-pixel text-[8px] leading-none text-[var(--accent)]">TAGS</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">标签</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {tags.length} 个标签</p>

      {tags.length === 0 ? (
        <p className="mt-8 border-2 border-dashed border-[var(--border)] px-6 py-12 text-center font-pixel text-[10px] text-[var(--muted)]">
          NO TAGS
        </p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-2.5">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className={`pixel-tag text-[var(--fg)] ${
                ASCII.test(tag.name) ? "font-pixel text-[9px]" : "text-[13px]"
              }`}
            >
              #{tag.name}
              <span className="ml-2 text-[10px] text-[var(--muted)]">{tag._count.posts}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
