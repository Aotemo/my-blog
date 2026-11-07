import Link from "next/link";

export function SiteFooter({
  siteTitle,
  authorName,
  githubUrl,
}: {
  siteTitle: string;
  authorName: string;
  githubUrl: string | null;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {siteTitle} · 由 {authorName} 用文字与代码搭建
        </p>
        <div className="flex items-center gap-4">
          <Link href="/rss.xml" className="transition hover:text-[var(--accent)]">
            RSS
          </Link>
          <Link href="/sitemap.xml" className="transition hover:text-[var(--accent)]">
            Sitemap
          </Link>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="transition hover:text-[var(--accent)]"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
