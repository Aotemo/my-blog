import type { Metadata } from "next";
import Link from "next/link";
import { getArchive } from "@/lib/posts";

export const metadata: Metadata = {
  title: "归档",
  description: "按年月浏览全部文章",
  alternates: { canonical: "/archive" },
};

export default async function ArchivePage() {
  const groups = await getArchive();
  const total = groups.reduce(
    (sum, group) => sum + group.months.reduce((monthSum, month) => monthSum + month.posts.length, 0),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">归档</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {total} 篇文章</p>

      {groups.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
          还没有已发布的文章。
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((group) => (
            <section key={group.year}>
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-2xl font-bold tracking-tight">{group.year}</h2>
                <span className="text-xs text-[var(--muted)]">
                  {group.months.reduce((sum, month) => sum + month.posts.length, 0)} 篇
                </span>
              </div>

              <div className="space-y-6 border-l border-[var(--border)] pl-5">
                {group.months.map((month) => (
                  <div key={`${group.year}-${month.month}`}>
                    <h3 className="mb-2 text-sm font-semibold text-[var(--muted)]">{month.month} 月</h3>
                    <ul className="space-y-2.5">
                      {month.posts.map((post) => (
                        <li key={post.id} className="flex items-baseline gap-3 text-sm">
                          <time className="shrink-0 font-mono text-xs text-[var(--muted)]">
                            {String(post.publishedAt ? new Date(post.publishedAt).getDate() : 1).padStart(2, "0")}
                          </time>
                          <Link
                            href={`/posts/${post.slug}`}
                            className="leading-snug transition hover:text-[var(--accent)]"
                          >
                            {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
