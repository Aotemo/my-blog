import Link from "next/link";
import { formatDate, formatNumber } from "@/lib/format";
import type { PostListItem } from "@/lib/posts";

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--accent)]/50 hover:shadow-[0_8px_30px_-18px_rgba(37,99,235,0.55)] sm:p-6">
      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--muted)]">
        <time dateTime={post.publishedAt?.toISOString() ?? undefined}>{formatDate(post.publishedAt)}</time>
        {post.category && (
          <>
            <span className="text-[var(--border)]">/</span>
            <Link
              href={`/categories/${post.category.slug}`}
              className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-medium text-[var(--accent)] transition hover:opacity-80"
            >
              {post.category.name}
            </Link>
          </>
        )}
        <span className="ml-auto inline-flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
          {formatNumber(post.viewCount)}
        </span>
      </div>

      <h2 className="text-xl font-semibold leading-snug tracking-tight">
        <Link href={`/posts/${post.slug}`} className="transition group-hover:text-[var(--accent)]">
          {post.title}
        </Link>
      </h2>

      {post.summary && (
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{post.summary}</p>
      )}

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
