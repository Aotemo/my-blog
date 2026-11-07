import Link from "next/link";
import type { getSidebarData } from "@/lib/posts";
import { formatDate } from "@/lib/format";

type SidebarData = Awaited<ReturnType<typeof getSidebarData>>;

export function SiteSidebar({ categories, tags, recentPosts }: SidebarData) {
  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">分类</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">暂无分类</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between gap-3">
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-[var(--foreground)] transition hover:text-[var(--accent)]"
                >
                  {category.name}
                </Link>
                <span className="text-xs text-[var(--muted)]">{category._count.posts}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">标签</h2>
        {tags.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">暂无标签</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">最近文章</h2>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">还没有文章</p>
        ) : (
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="block text-sm leading-snug transition hover:text-[var(--accent)]"
                >
                  {post.title}
                </Link>
                <time className="mt-0.5 block text-xs text-[var(--muted)]">{formatDate(post.publishedAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
