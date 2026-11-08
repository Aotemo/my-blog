import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { Pagination } from "@/components/pagination";
import { ADMIN_PAGE_SIZE, POST_STATUS } from "@/lib/constants";
import { formatDateTime, formatNumber } from "@/lib/format";
import prisma from "@/lib/prisma";
import { publishedPostWhere, scheduledPostWhere } from "@/lib/visibility";

export const metadata: Metadata = {
  title: "文章管理",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ status?: string; q?: string; sort?: string; page?: string }> };

const STATUS_TABS = [
  { value: "ALL", label: "全部" },
  { value: POST_STATUS.PUBLISHED, label: "已发布" },
  { value: "SCHEDULED", label: "定时" },
  { value: POST_STATUS.DRAFT, label: "草稿" },
];

const SORTS = [
  { value: "updated_desc", label: "最近更新" },
  { value: "published_desc", label: "发布时间 ↓" },
  { value: "published_asc", label: "发布时间 ↑" },
];

export default async function AdminPostsPage({ searchParams }: Props) {
  const { status, q, sort, page } = await searchParams;
  const activeStatus = STATUS_TABS.some((tab) => tab.value === status) ? status! : "ALL";
  const activeSort = SORTS.some((item) => item.value === sort) ? sort! : "updated_desc";
  const query = typeof q === "string" ? q.trim() : "";
  const currentPage = Math.max(1, Number(page) || 1);
  const now = new Date();

  const baseWhere: Prisma.PostWhereInput =
    activeStatus === "SCHEDULED"
      ? scheduledPostWhere(now)
      : activeStatus === POST_STATUS.PUBLISHED
        ? publishedPostWhere(now)
        : activeStatus === POST_STATUS.DRAFT
          ? { status: POST_STATUS.DRAFT }
          : {};

  const where: Prisma.PostWhereInput = {
    ...baseWhere,
    ...(query ? { OR: [{ title: { contains: query } }, { slug: { contains: query } }] } : {}),
  };

  const orderBy: Prisma.PostOrderByWithRelationInput[] =
    activeSort === "published_desc"
      ? [{ publishedAt: "desc" }, { createdAt: "desc" }]
      : activeSort === "published_asc"
        ? [{ publishedAt: "asc" }, { createdAt: "asc" }]
        : [{ updatedAt: "desc" }];

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { category: true, tags: true },
      orderBy,
      skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  function buildHref(overrides: { status?: string; sort?: string }) {
    const params = new URLSearchParams();
    const nextStatus = overrides.status ?? activeStatus;
    const nextSort = overrides.sort ?? activeSort;
    if (nextStatus !== "ALL") params.set("status", nextStatus);
    if (nextSort !== "updated_desc") params.set("sort", nextSort);
    if (query) params.set("q", query);
    const search = params.toString();
    return search ? `/admin/posts?${search}` : "/admin/posts";
  }

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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value })}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                activeStatus === tab.value
                  ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form action="/admin/posts" method="get" className="flex gap-2">
          {activeStatus !== "ALL" && <input type="hidden" name="status" value={activeStatus} />}
          {activeSort !== "updated_desc" && <input type="hidden" name="sort" value={activeSort} />}
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

      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <span>排序</span>
        {SORTS.map((item) => (
          <Link
            key={item.value}
            href={buildHref({ sort: item.value })}
            className={
              activeSort === item.value
                ? "rounded px-2 py-1 font-medium text-[var(--accent)]"
                : "rounded px-2 py-1 transition hover:text-[var(--foreground)]"
            }
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {posts.length === 0 ? (
          <p className="p-10 text-center text-sm text-[var(--muted)]">没有符合条件的文章。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">标题</th>
                  <th className="px-3 py-3 font-medium">状态</th>
                  <th className="px-3 py-3 font-medium">分类</th>
                  <th className="px-3 py-3 font-medium">发布时间</th>
                  <th className="px-3 py-3 text-right font-medium">阅读</th>
                  <th className="px-5 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {posts.map((post) => {
                  const scheduled =
                    post.status === POST_STATUS.PUBLISHED &&
                    post.publishedAt !== null &&
                    post.publishedAt.getTime() > now.getTime();

                  const statusLabel =
                    post.status === POST_STATUS.DRAFT ? "草稿" : scheduled ? "定时" : "已发布";

                  return (
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
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            post.status === POST_STATUS.DRAFT
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              : scheduled
                                ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          }`}
                        >
                          {statusLabel}
                        </span>
                        {scheduled && post.publishedAt && (
                          <span className="mt-1 block whitespace-nowrap text-[11px] text-[var(--muted)]">
                            {formatDateTime(post.publishedAt)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[var(--muted)]">{post.category?.name ?? "未分类"}</td>
                      <td className="px-3 py-3 text-xs text-[var(--muted)]">
                        {formatDateTime(post.publishedAt)}
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-[var(--muted)]">
                        {formatNumber(post.viewCount)}
                      </td>
                      <td className="px-5 py-3">
                        <PostRowActions id={post.id} slug={post.slug} status={post.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/posts"
        searchParams={{
          status: activeStatus !== "ALL" ? activeStatus : undefined,
          sort: activeSort !== "updated_desc" ? activeSort : undefined,
          q: query || undefined,
        }}
      />
    </div>
  );
}
