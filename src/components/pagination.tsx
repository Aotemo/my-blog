import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

function buildHref(basePath: string, page: number, searchParams?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let page = Math.max(1, end - 4); page <= end; page += 1) {
    pages.push(page);
  }

  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center border-2 border-[var(--border)] px-2.5 font-pixel text-[10px] leading-none text-[var(--muted)] transition-colors duration-75 hover:border-[var(--ink)] hover:text-[var(--fg)]";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="分页">
      {currentPage > 1 && (
        <Link href={buildHref(basePath, currentPage - 1, searchParams)} className={`${linkClass} px-3`}>
          &lt; PREV
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, page, searchParams)}
          aria-current={page === currentPage ? "page" : undefined}
          className={
            page === currentPage
              ? "inline-flex h-9 min-w-9 items-center justify-center border-2 border-[var(--ink)] bg-[var(--accent)] px-2.5 font-pixel text-[10px] leading-none text-[var(--bg)]"
              : linkClass
          }
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link href={buildHref(basePath, currentPage + 1, searchParams)} className={`${linkClass} px-3`}>
          NEXT &gt;
        </Link>
      )}
    </nav>
  );
}
