import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { PixelSprite } from "@/components/pixel-icons";
import { PostCard } from "@/components/post-card";
import { getSiteSettings } from "@/lib/settings";
import { listPublishedPosts } from "@/lib/posts";

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

  const [result, settings] = await Promise.all([
    listPublishedPosts({ page: currentPage }),
    getSiteSettings(),
  ]);

  const { posts, total, totalPages } = result;

  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-10 sm:py-14">
      <section className="pixel-frame p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="shrink-0 border-2 border-[var(--ink)] bg-[var(--tag-bg)] p-1.5">
            <PixelSprite className="pixel-avatar h-11 w-11 text-[var(--accent)]" />
          </div>

          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-pixel text-[10px] leading-relaxed text-[var(--accent)]">
              <span>&gt; HELLO, I&apos;M</span>
              <span className="font-sans text-lg font-bold tracking-tight text-[var(--fg)]">
                {settings.authorName}
              </span>
              <span className="pixel-cursor text-[var(--accent-2)]" aria-hidden>
                _
              </span>
            </p>

            <p className="mt-4 text-[15px] leading-[1.8] text-[var(--muted)]">
              {settings.siteDescription}
            </p>

            <Link
              href="/about"
              className="pixel-link mt-5 inline-flex items-center gap-1.5 font-pixel text-[9px] text-[var(--accent)]"
            >
              ABOUT ME <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-12 flex items-center gap-3">
        <span className="font-pixel text-[9px] leading-none text-[var(--muted)]">LATEST POSTS</span>
        <span className="pixel-divider flex-1" aria-hidden />
        <span className="font-pixel text-[9px] leading-none text-[var(--muted)]">
          {String(currentPage).padStart(2, "0")}/{String(totalPages).padStart(2, "0")}
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 border-2 border-dashed border-[var(--border)] px-6 py-14 text-center">
          <p className="font-pixel text-[11px] text-[var(--muted)]">NO POSTS FOUND</p>
          <p className="mt-3 text-sm text-[var(--muted)]">还没有已发布的文章。</p>
        </div>
      ) : (
        <div className="mt-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <span className="text-xs text-[var(--muted)]">共 {total} 篇</span>
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
      </div>
    </div>
  );
}
