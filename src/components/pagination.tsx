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
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition";

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="分页">
      {currentPage > 1 && (
        <Link
          href={buildHref(basePath, currentPage - 1, searchParams)}
          className={`${linkClass} border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]`}
        >
          上一页
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, page, searchParams)}
          aria-current={page === currentPage ? "page" : undefined}
          className={
            page === currentPage
              ? `${linkClass} border-[var(--accent)] bg-[var(--accent)] text-white`
              : `${linkClass} border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]`
          }
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={buildHref(basePath, currentPage + 1, searchParams)}
          className={`${linkClass} border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]`}
        >
          下一页
        </Link>
      )}
    </nav>
  );
}
