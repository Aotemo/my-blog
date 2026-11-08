import Link from "next/link";
import { PixelGithub, PixelRss } from "./pixel-icons";
import { getZonedParts } from "@/lib/format";

export function SiteFooter({
  authorName,
  githubUrl,
}: {
  siteTitle: string;
  authorName: string;
  githubUrl: string | null;
}) {
  const year = getZonedParts(new Date()).year;

  return (
    <footer className="mt-20 border-t-2 border-[var(--ink)]">
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-pixel text-[10px] leading-none">
          <Link href="/categories" className="pixel-link px-1 py-1.5 text-[var(--muted)]">
            CATEGORIES
          </Link>
          <Link href="/tags" className="pixel-link px-1 py-1.5 text-[var(--muted)]">
            TAGS
          </Link>
          <Link href="/archive" className="pixel-link px-1 py-1.5 text-[var(--muted)]">
            ARCHIVE
          </Link>
          <Link href="/rss.xml" className="pixel-link flex items-center gap-1.5 px-1 py-1.5 text-[var(--muted)]">
            <PixelRss className="h-3 w-3" />
            RSS
          </Link>
          <Link href="/sitemap.xml" className="pixel-link px-1 py-1.5 text-[var(--muted)]">
            SITEMAP
          </Link>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="pixel-link flex items-center gap-1.5 px-1 py-1.5 text-[var(--muted)]"
            >
              <PixelGithub className="h-3 w-3" />
              GITHUB
            </a>
          )}
        </div>

        <p className="text-xs leading-relaxed text-[var(--muted)]">
          <span className="font-pixel text-[10px]">© {year}</span> {authorName}
          <span className="mx-2">·</span>
          <span className="font-pixel text-[10px]">INSERT COIN TO CONTINUE</span>
        </p>
      </div>
    </footer>
  );
}
