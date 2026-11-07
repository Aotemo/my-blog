import type { Metadata } from "next";
import Link from "next/link";
import { CommentActions } from "@/components/admin/comment-actions";
import { formatDateTime } from "@/lib/format";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "评论管理",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ filter?: string }> };

const FILTERS = [
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "all", label: "全部" },
];

export default async function AdminCommentsPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const activeFilter = filter === "approved" || filter === "all" ? filter : "pending";

  const where =
    activeFilter === "all" ? {} : { approved: activeFilter === "approved" };

  const [comments, total, pendingCount, approvedCount] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { post: { select: { title: true, slug: true } } },
    }),
    prisma.comment.count({ where }),
    prisma.comment.count({ where: { approved: false } }),
    prisma.comment.count({ where: { approved: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">评论</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          待审核 {pendingCount} 条 · 已通过 {approvedCount} 条
        </p>
      </div>

      <div className="flex gap-1">
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={`/admin/comments?filter=${item.value}`}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              activeFilter === item.value
                ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {item.label}
            {item.value === "pending" ? ` (${pendingCount})` : item.value === "approved" ? ` (${approvedCount})` : ""}
          </Link>
        ))}
      </div>

      <p className="text-xs text-[var(--muted)]">共 {total} 条</p>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
            没有符合条件的评论。
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                <span className="text-sm font-medium text-[var(--foreground)]">{comment.author}</span>
                {comment.email && <span>{comment.email}</span>}
                <time dateTime={comment.createdAt.toISOString()}>{formatDateTime(comment.createdAt)}</time>
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    comment.approved
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  {comment.approved ? "已通过" : "待审核"}
                </span>
                <Link
                  href={`/admin/posts/${comment.postId}/edit`}
                  className="ml-auto max-w-[40%] truncate transition hover:text-[var(--accent)]"
                >
                  {comment.post.title}
                </Link>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{comment.content}</p>

              <div className="mt-4 flex justify-end">
                <CommentActions id={comment.id} approved={comment.approved} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
