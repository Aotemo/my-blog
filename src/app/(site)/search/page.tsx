import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { listPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索文章标题、摘要与正文",
  alternates: { canonical: "/search" },
};

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const currentPage = Math.max(1, Number(page) || 1);

  const result = query
    ? await listPublishedPosts({ page: currentPage, query })
    : { posts: [], total: 0, totalPages: 1, page: 1 };

  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-10 sm:py-14">
      <p className="font-pixel text-[8px] leading-none text-[var(--accent)]">SEARCH</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">搜索</h1>

      <form action="/search" method="get" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="输入关键字，回车搜索"
          aria-label="搜索文章"
          className="pixel-input h-11 flex-1 px-3 text-sm"
        />
        <button type="submit" className="pixel-btn pixel-btn-primary h-11 px-4 font-pixel text-[10px]">
          SEARCH
        </button>
      </form>

      {!query ? (
        <p className="mt-8 border-2 border-dashed border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--muted)]">
          输入关键字开始搜索，范围包括标题、摘要和正文。
        </p>
      ) : (
        <>
          <p className="mt-6 flex flex-wrap items-baseline gap-2 text-[13px] leading-relaxed text-[var(--muted)]">
            <span className="font-pixel text-[10px]">&gt;</span>
            <span className="font-bold text-[var(--fg)]">{query}</span>
            <span className="font-pixel text-[10px]">/ {result.total} RESULTS</span>
          </p>

          <div className="mt-2">
            {result.posts.length === 0 ? (
              <div className="mt-6 border-2 border-dashed border-[var(--border)] px-6 py-14 text-center">
                <p className="font-pixel text-[11px] text-[var(--muted)]">NO ITEMS FOUND</p>
                <p className="mt-3 text-sm text-[var(--muted)]">没有找到相关文章，换个关键字试试。</p>
              </div>
            ) : (
              result.posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>

          <div className="mt-10">
            <Pagination
              currentPage={currentPage}
              totalPages={result.totalPages}
              basePath="/search"
              searchParams={{ q: query }}
            />
          </div>
        </>
      )}
    </div>
  );
}
