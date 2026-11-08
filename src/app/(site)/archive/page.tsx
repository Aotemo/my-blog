import type { Metadata } from "next";
import Link from "next/link";
import { getZonedParts } from "@/lib/format";
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
    <div className="mx-auto w-full max-w-[680px] px-5 py-10 sm:py-14">
      <p className="font-pixel text-[8px] leading-none text-[var(--accent)]">ARCHIVE</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">归档</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {total} 篇文章</p>

      {groups.length === 0 ? (
        <p className="mt-8 border-2 border-dashed border-[var(--border)] px-6 py-12 text-center font-pixel text-[10px] text-[var(--muted)]">
          NO POSTS
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {groups.map((group) => (
            <section key={group.year}>
              <div className="flex items-center gap-3">
                <h2 className="font-pixel text-base leading-none">{group.year}</h2>
                <span className="pixel-divider flex-1" aria-hidden />
                <span className="font-pixel text-[8px] leading-none text-[var(--muted)]">
                  {group.months.reduce((sum, month) => sum + month.posts.length, 0)} POSTS
                </span>
              </div>

              <div className="mt-5 space-y-7">
                {group.months.map((month) => (
                  <div key={`${group.year}-${month.month}`}>
                    <h3 className="font-pixel text-[9px] leading-none text-[var(--muted)]">
                      {String(month.month).padStart(2, "0")}
                      <span className="ml-1.5 font-sans text-[11px]">月</span>
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {month.posts.map((post) => (
                        <li key={post.id} className="flex items-baseline gap-3 text-[15px]">
                          <span className="w-6 shrink-0 font-pixel text-[9px] leading-none text-[var(--muted)]">
                            {String(post.publishedAt ? getZonedParts(post.publishedAt).day : 1).padStart(
                              2,
                              "0",
                            )}
                          </span>
                          <Link href={`/posts/${post.slug}`} className="pixel-link px-1 leading-snug">
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
