/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "关于",
    description: `关于 ${settings.authorName} 与 ${settings.siteTitle}`,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-bold tracking-tight">关于</h1>

      <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-9">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          {settings.avatarUrl ? (
            <img
              src={settings.avatarUrl}
              alt={settings.authorName}
              className="h-20 w-20 rounded-full border border-[var(--border)] object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl font-bold text-[var(--accent)]">
              {settings.authorName.slice(0, 1)}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold tracking-tight">{settings.authorName}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{settings.siteTitle}</p>
          </div>
        </div>

        {settings.authorBio && (
          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]">
            {settings.authorBio}
          </p>
        )}

        <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">{settings.siteDescription}</p>

        {settings.githubUrl && (
          <a
            href={settings.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] px-4 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
            访问 GitHub
          </a>
        )}
      </section>
    </div>
  );
}
