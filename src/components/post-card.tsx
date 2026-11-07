import Link from "next/link";
import { PixelEye } from "@/components/pixel-icons";
import { formatDate, formatNumber } from "@/lib/format";
import type { PostListItem } from "@/lib/posts";

const ASCII = /^[\x20-\x7e]+$/;

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className="py-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[var(--muted)]">
        <time
          className="font-pixel text-[10px] leading-none"
          dateTime={post.publishedAt?.toISOString() ?? undefined}
        >
          {formatDate(post.publishedAt)}
        </time>

        {post.category && (
          <Link
            href={`/categories/${post.category.slug}`}
            className="pixel-link px-1 text-[11px] leading-none text-[var(--accent)]"
          >
            [{post.category.name}]
          </Link>
        )}

        <span className="ml-auto inline-flex items-center gap-1.5 font-pixel text-[10px] leading-none">
          <PixelEye className="h-3 w-3" />
          {formatNumber(post.viewCount)}
        </span>
      </div>

      <h2 className="mt-2.5 text-xl font-bold leading-snug tracking-tight">
        <Link href={`/posts/${post.slug}`} className="pixel-link inline">
          {post.title}
        </Link>
      </h2>

      {post.summary && (
        <p className="mt-1.5 line-clamp-2 text-[15px] leading-[1.8] text-[var(--muted)]">{post.summary}</p>
      )}

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className={`pixel-tag text-[var(--fg)] ${
                ASCII.test(tag.name) ? "font-pixel text-[10px]" : "text-[11px]"
              }`}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="pixel-divider mt-6" aria-hidden />
    </article>
  );
}
