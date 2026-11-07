import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader siteTitle={settings.siteTitle} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        siteTitle={settings.siteTitle}
        authorName={settings.authorName}
        githubUrl={settings.githubUrl}
      />
    </div>
  );
}
