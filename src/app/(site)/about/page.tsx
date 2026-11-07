/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { PixelGithub, PixelSprite } from "@/components/pixel-icons";
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
    <div className="mx-auto w-full max-w-[680px] px-5 py-10 sm:py-14">
      <p className="font-pixel text-[8px] leading-none text-[var(--accent)]">ABOUT</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">关于</h1>

      <section className="pixel-frame mt-8 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          {settings.avatarUrl ? (
            <img
              src={settings.avatarUrl}
              alt={settings.authorName}
              className="pixel-avatar h-20 w-20 border-2 border-[var(--ink)] object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-[var(--ink)] bg-[var(--tag-bg)]">
              <PixelSprite className="h-10 w-10 text-[var(--accent)]" />
            </div>
          )}

          <div>
            <p className="font-pixel text-[8px] leading-none text-[var(--muted)]">PLAYER 1</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight">{settings.authorName}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{settings.siteTitle}</p>
          </div>
        </div>

        {settings.authorBio && (
          <p className="mt-6 whitespace-pre-line text-[16px] leading-[1.8]">{settings.authorBio}</p>
        )}

        <p className="mt-6 text-[15px] leading-[1.8] text-[var(--muted)]">{settings.siteDescription}</p>

        {settings.githubUrl && (
          <a
            href={settings.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="pixel-btn mt-7 h-10 gap-2 px-4 font-pixel text-[9px]"
          >
            <PixelGithub className="h-3.5 w-3.5" />
            GITHUB
          </a>
        )}
      </section>
    </div>
  );
}
