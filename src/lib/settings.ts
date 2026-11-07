import prisma from "./prisma";

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  authorName: string;
  authorBio: string;
  avatarUrl: string | null;
  githubUrl: string | null;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: "山间笔记",
  siteDescription: "记录技术、思考与生活的地方",
  authorName: "站长",
  authorBio: "一名喜欢写代码、也喜欢写字的开发者。",
  avatarUrl: null,
  githubUrl: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSetting.findUnique({ where: { id: "site" } });
    if (!settings) {
      return DEFAULT_SETTINGS;
    }
    return {
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      authorName: settings.authorName,
      authorBio: settings.authorBio,
      avatarUrl: settings.avatarUrl,
      githubUrl: settings.githubUrl,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
