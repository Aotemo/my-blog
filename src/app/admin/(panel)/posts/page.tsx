import type { Metadata } from "next";
import Link from "next/link";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { Pagination } from "@/components/pagination";
import { ADMIN_PAGE_SIZE, POST_STATUS } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "文章管理",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ status?: string; q?: string; page?: string }> };

const STATUS_TABS = [
  { value: "ALL", label: "全部" },
  { value: POST_STATUS.PUBLISHED, label: "已发布" },
  { value: POST_STATUS.DRAFT, label: "草稿" },
];

export default async function AdminPostsPage({ searchParams }: Props) {
  const { status, q, page } = await searchParams;
  const activeStatus =
    status === POST_STATUS.PUBLISHED || status === POST_STATUS.DRAFT ? status : "ALL";
  const query = typeof q === "string" ? q.trim() : "";
  const currentPage = Math.max(1, Number(page) || 1);

  const where = {
    ...(activeStatus !== "ALL" ? { status: activeStatus } : {}),
    ...(query ? { OR: [{ title: { contains: query } }, { slug: { contains: query } }] } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { category: true, tags: true },
      orderBy: [{ updatedAt: "desc" }],
      skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文章</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">共 {total} 篇</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-10 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
        >
          新建文章
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {STATUS_TABS.map((tab) => {
            const params = new URLSearchParams();
            if (tab.value !== "ALL") params.set("status", tab.value);
            if (query) params.set("q", query);
            const href = params.toString() ? `/admin/posts?${params.toString()}` : "/admin/posts";
            return (
              <Link
                key={tab.value}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  activeStatus === tab.value
                    ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <form action="/admin/posts" method="get" className="flex gap-2">
          {activeStatus !== "ALL" && <input type="hidden" name="status" value={activeStatus} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="搜索标题或 slug"
            aria-label="搜索文章"
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition focus:border-[var(--accent)] sm:w-56"
          />
          <button
            type="submit"
            className="h-9 shrink-0 rounded-lg border border-[var(--border)] px-3 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            搜索
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {posts.length === 0 ? (
          <p className="p-10 text-center text-sm text-[var(--muted)]">没有符合条件的文章。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">标题</th>
                  <th className="px-3 py-3 font-medium">状态</th>
                  <th className="px-3 py-3 font-medium">分类</th>
                  <th className="px-3 py-3 font-medium">更新时间</th>
                  <th className="px-3 py-3 text-right font-medium">阅读</th>
                  <th className="px-5 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {posts.map((post) => (
                  <tr key={post.id} className="align-middle">
                    <td className="max-w-[280px] px-5 py-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="block truncate font-medium transition hover:text-[var(--accent)]"
                      >
                        {post.title}
                      </Link>
                      <span className="mt-0.5 block truncate font-mono text-xs text-[var(--muted)]">
                        /{post.slug}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          post.status === POST_STATUS.PUBLISHED
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        }`}
                      >
                        {post.status === POST_STATUS.PUBLISHED ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[var(--muted)]">{post.category?.name ?? "未分类"}</td>
                    <td className="px-3 py-3 text-xs text-[var(--muted)]">{formatDate(post.updatedAt)}</td>
                    <td className="px-3 py-3 text-right text-xs text-[var(--muted)]">
                      {formatNumber(post.viewCount)}
                    </td>
                    <td className="px-5 py-3">
                      <PostRowActions id={post.id} slug={post.slug} status={post.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/posts"
        searchParams={{ status: activeStatus !== "ALL" ? activeStatus : undefined, q: query || undefined }}
      />
    </div>
  );
}
