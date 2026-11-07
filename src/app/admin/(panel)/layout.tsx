import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const settings = await getSiteSettings();

  return (
    <div className="admin-ui min-h-screen bg-[var(--background)] lg:flex">
      <aside className="border-b border-[var(--border)] bg-[var(--surface)] lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
                {settings.siteTitle.slice(0, 1)}
              </span>
              <span className="text-sm font-semibold">{settings.siteTitle}</span>
            </Link>
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
              后台
            </span>
          </div>

          <AdminNav />

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-sm lg:flex-col lg:items-start lg:gap-2">
            <span className="text-xs text-[var(--muted)]">已登录：{session.username}</span>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]">
                查看站点
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
