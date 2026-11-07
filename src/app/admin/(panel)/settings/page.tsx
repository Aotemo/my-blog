import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "站点设置",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">站点设置</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">修改后前台立即生效</p>
      </div>

      <SettingsForm initial={settings} />
    </div>
  );
}
