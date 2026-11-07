import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-24">
      <div className="text-center">
        <p className="text-7xl font-black tracking-tighter text-[var(--accent)]">404</p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">页面不存在</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">你访问的页面可能已被删除、移动，或者只是一个草稿。</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90"
          >
            返回首页
          </Link>
          <Link
            href="/archive"
            className="inline-flex h-10 items-center rounded-full border border-[var(--border)] px-5 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            浏览归档
          </Link>
        </div>
      </div>
    </div>
  );
}
