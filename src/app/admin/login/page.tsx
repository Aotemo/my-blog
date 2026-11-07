import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "登录",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const session = await getSession();
  if (session) redirect("/admin");

  const { next } = await searchParams;
  const target = typeof next === "string" && next.startsWith("/admin") ? next : "/admin";
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]">
            ← 返回 {settings.siteTitle}
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">管理后台</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">登录后可以撰写与管理系统内容</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <LoginForm next={target} />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          默认账号见 .env 中的 ADMIN_USERNAME / ADMIN_PASSWORD
        </p>
      </div>
    </div>
  );
}
