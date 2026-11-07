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
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">搜索</h1>

      <form action="/search" method="get" className="mt-5 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="输入关键字，回车搜索"
          aria-label="搜索文章"
          className="h-11 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none transition focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          className="h-11 rounded-xl bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90"
        >
          搜索
        </button>
      </form>

      {!query ? (
        <p className="mt-8 text-sm text-[var(--muted)]">输入关键字开始搜索，范围包括标题、摘要和正文。</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-[var(--muted)]">
            「{query}」共找到 {result.total} 篇文章
          </p>

          <div className="mt-5 space-y-4">
            {result.posts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
                没有找到相关文章，换个关键字试试。
              </p>
            ) : (
              result.posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={result.totalPages}
            basePath="/search"
            searchParams={{ q: query }}
          />
        </>
      )}
    </div>
  );
}
