"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "仪表盘", exact: true },
  { href: "/admin/posts", label: "文章" },
  { href: "/admin/categories", label: "分类" },
  { href: "/admin/tags", label: "标签" },
  { href: "/admin/comments", label: "评论" },
  { href: "/admin/settings", label: "站点设置" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`shrink-0 rounded-lg px-3 py-2 text-sm transition ${
            isActive(pathname, item.href, item.exact)
              ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
              : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
