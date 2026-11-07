import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { SiteSidebar } from "@/components/site-sidebar";
import { getSiteSettings } from "@/lib/settings";
import { getSidebarData, listPublishedPosts } from "@/lib/posts";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    description: settings.siteDescription,
    alternates: { canonical: "/" },
  };
}

type SearchParams = Promise<{ page?: string }>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [result, sidebar, settings] = await Promise.all([
    listPublishedPosts({ page: currentPage }),
    getSidebarData(),
    getSiteSettings(),
  ]);

  const { posts, total, totalPages } = result;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <section className="mb-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Journal</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{settings.siteTitle}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          {settings.siteDescription}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
          <span>共 {total} 篇文章</span>
          <span>{sidebar.categories.length} 个分类</span>
          <span>{sidebar.tags.length} 个标签</span>
          <span>作者：{settings.authorName}</span>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">最新文章</h2>
            <span className="text-xs text-[var(--muted)]">
              第 {currentPage} / {totalPages} 页
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
              还没有已发布的文章，去后台写第一篇吧。
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
        </div>

        <SiteSidebar {...sidebar} />
      </div>
    </div>
  );
}
