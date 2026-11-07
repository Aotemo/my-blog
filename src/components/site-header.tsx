"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/archive", label: "归档" },
  { href: "/about", label: "关于" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ siteTitle }: { siteTitle: string }) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
            {siteTitle.slice(0, 1)}
          </span>
          <span className="text-base font-semibold tracking-tight group-hover:text-[var(--accent)]">
            {siteTitle}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                isActive(pathname, item.href)
                  ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form action="/search" method="get" className="hidden lg:block">
            <div className="relative">
              <input
                type="search"
                name="q"
                placeholder="搜索文章"
                aria-label="搜索文章"
                className="h-9 w-40 rounded-full border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm outline-none transition focus:w-52 focus:border-[var(--accent)]"
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>
          </form>
          <ThemeToggle />
          <Link
            href="/admin"
            className="hidden h-9 items-center rounded-full border border-[var(--border)] px-3 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-flex"
          >
            管理
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="切换菜单"
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-5 py-3 md:hidden">
          <form action="/search" method="get" className="mb-2">
            <input
              type="search"
              name="q"
              placeholder="搜索文章"
              aria-label="搜索文章"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </form>
          <div className="grid grid-cols-2 gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm ${
                  isActive(pathname, item.href)
                    ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/admin" className="rounded-lg px-3 py-2.5 text-sm text-[var(--muted)]">
              后台管理
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
