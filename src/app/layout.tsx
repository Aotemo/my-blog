import type { Metadata } from "next";
import "./globals.css";
import { monoFont, pixelFont } from "@/lib/fonts";
import { getSiteSettings, getSiteUrl } from "@/lib/settings";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: settings.siteTitle,
      template: `%s · ${settings.siteTitle}`,
    },
    description: settings.siteDescription,
    authors: [{ name: settings.authorName }],
    openGraph: {
      type: "website",
      siteName: settings.siteTitle,
      title: settings.siteTitle,
      description: settings.siteDescription,
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description: settings.siteDescription,
    },
    alternates: {
      types: {
        "application/rss+xml": "/rss.xml",
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${pixelFont.variable} ${monoFont.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
