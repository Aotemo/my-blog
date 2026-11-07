import type { Metadata } from "next";
import Link from "next/link";
import { POST_STATUS } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "仪表盘",
  robots: { index: false, follow: false },
};

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [total, published, draft, commentTotal, pendingComments, views, categoryCount, tagCount, recent] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: POST_STATUS.PUBLISHED } }),
      prisma.post.count({ where: { status: POST_STATUS.DRAFT } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { category: true },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">站点内容概览</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-10 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90"
        >
          新建文章
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="文章总数" value={String(total)} hint={`已发布 ${published} · 草稿 ${draft}`} />
        <StatCard label="评论" value={String(commentTotal)} hint={`待审核 ${pendingComments}`} />
        <StatCard label="总阅读量" value={formatNumber(views._sum.viewCount ?? 0)} />
        <StatCard label="分类 / 标签" value={`${categoryCount} / ${tagCount}`} hint="在左侧管理" />
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold">最近更新的文章</h2>
          <Link href="/admin/posts" className="text-sm text-[var(--accent)] hover:underline">
            全部文章
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--muted)]">还没有文章，去写第一篇吧。</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recent.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    post.status === POST_STATUS.PUBLISHED
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  {post.status === POST_STATUS.PUBLISHED ? "已发布" : "草稿"}
                </span>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="min-w-0 flex-1 truncate text-sm font-medium transition hover:text-[var(--accent)]"
                >
                  {post.title}
                </Link>
                <span className="text-xs text-[var(--muted)]">{post.category?.name ?? "未分类"}</span>
                <time className="text-xs text-[var(--muted)]">{formatDate(post.updatedAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
