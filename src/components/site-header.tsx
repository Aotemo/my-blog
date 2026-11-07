"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PixelSearch, PixelSprite } from "./pixel-icons";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "HOME", cn: "首页" },
  { href: "/categories", label: "CATS", cn: "分类" },
  { href: "/tags", label: "TAGS", cn: "标签" },
  { href: "/archive", label: "ARCHIVE", cn: "归档" },
  { href: "/about", label: "ABOUT", cn: "关于" },
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
    <header className="sticky top-0 z-40 border-b-2 border-[var(--ink)] bg-[var(--bg)]">
      <div className="mx-auto flex h-16 w-full max-w-[680px] items-center justify-between gap-3 px-5">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label={`${siteTitle} 首页`}>
          <PixelSprite className="h-4 w-4 shrink-0 text-[var(--accent)]" />
          <span className="font-pixel text-[10px] leading-none text-[var(--accent)]">BLOG</span>
          <span className="truncate border-l-2 border-[var(--border)] pl-2.5 text-[15px] font-bold tracking-tight">
            {siteTitle}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.cn}
                aria-current={active ? "page" : undefined}
                className={`px-1.5 py-2 font-pixel text-[10px] leading-none transition-colors duration-75 ${
                  active
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/search" aria-label="搜索文章" className="pixel-btn h-8 w-8 p-0">
            <PixelSearch className="h-3.5 w-3.5" />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
            className="pixel-btn h-8 w-8 p-0 md:hidden"
          >
            <svg
              viewBox="0 0 8 8"
              className="h-3.5 w-3.5"
              shapeRendering="crispEdges"
              fill="currentColor"
              aria-hidden
            >
              {open ? (
                <>
                  <rect x="1" y="1" width="1" height="1" />
                  <rect x="2" y="2" width="1" height="1" />
                  <rect x="3" y="3" width="1" height="1" />
                  <rect x="4" y="3" width="1" height="1" />
                  <rect x="5" y="2" width="1" height="1" />
                  <rect x="6" y="1" width="1" height="1" />
                  <rect x="5" y="4" width="1" height="1" />
                  <rect x="6" y="5" width="1" height="1" />
                  <rect x="4" y="4" width="1" height="1" />
                  <rect x="3" y="4" width="1" height="1" />
                  <rect x="2" y="5" width="1" height="1" />
                  <rect x="1" y="6" width="1" height="1" />
                </>
              ) : (
                <>
                  <rect x="1" y="2" width="6" height="1" />
                  <rect x="1" y="4" width="6" height="1" />
                  <rect x="1" y="6" width="6" height="1" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t-2 border-[var(--ink)] bg-[var(--surface)] md:hidden">
          <nav className="mx-auto grid w-full max-w-[680px] gap-1 px-5 py-4" aria-label="移动端导航">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-2.5 font-pixel text-[10px] leading-none ${
                    active
                      ? "bg-[var(--accent)] text-[var(--bg)]"
                      : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  }`}
                >
                  {item.label}
                  <span className="ml-3 font-sans text-xs opacity-70">{item.cn}</span>
                </Link>
              );
            })}
            <Link href="/search" className="px-2 py-2.5 font-pixel text-[10px] text-[var(--muted)]">
              SEARCH<span className="ml-3 font-sans text-xs opacity-70">搜索</span>
            </Link>
            <Link
              href="/admin"
              className="mt-2 border-t-2 border-dashed border-[var(--border)] px-2 pt-3 font-pixel text-[10px] text-[var(--muted)]"
            >
              ADMIN<span className="ml-3 font-sans text-xs opacity-70">管理</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
