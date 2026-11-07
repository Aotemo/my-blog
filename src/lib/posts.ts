import type { Prisma } from "@prisma/client";
import { PAGE_SIZE, POST_STATUS } from "./constants";
import prisma from "./prisma";
import { slugifyName } from "./slug";

export const postListInclude = {
  category: true,
  tags: true,
} satisfies Prisma.PostInclude;

// 列表与列表型接口不返回完整正文，避免响应体过大
export const postListOmit = { content: true } satisfies Prisma.PostOmit;

export type PostListItem = Prisma.PostGetPayload<{
  include: typeof postListInclude;
  omit: typeof postListOmit;
}>;

export type PostListResult = {
  posts: PostListItem[];
  total: number;
  totalPages: number;
  page: number;
};

type ListOptions = {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  tagSlug?: string;
  query?: string;
};

export async function listPublishedPosts({
  page = 1,
  pageSize = PAGE_SIZE,
  categorySlug,
  tagSlug,
  query,
}: ListOptions): Promise<PostListResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const where: Prisma.PostWhereInput = {
    status: POST_STATUS.PUBLISHED,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { summary: { contains: query } },
            { content: { contains: query } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      omit: postListOmit,
      include: postListInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page: safePage,
  };
}

export async function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: POST_STATUS.PUBLISHED },
    include: {
      ...postListInclude,
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function incrementViewCount(id: string) {
  try {
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // 阅读量统计失败不影响页面渲染
  }
}

export async function getAdjacentPosts(post: { id: string; publishedAt: Date | null }) {
  const anchor = post.publishedAt ?? new Date();
  const [previous, next] = await Promise.all([
    prisma.post.findFirst({
      where: {
        status: POST_STATUS.PUBLISHED,
        id: { not: post.id },
        publishedAt: { lt: anchor },
      },
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true },
    }),
    prisma.post.findFirst({
      where: {
        status: POST_STATUS.PUBLISHED,
        id: { not: post.id },
        publishedAt: { gt: anchor },
      },
      orderBy: { publishedAt: "asc" },
      select: { title: true, slug: true },
    }),
  ]);
  return { previous, next };
}

export type ArchiveGroup = {
  year: number;
  months: { month: number; posts: { id: string; title: string; slug: string; publishedAt: Date | null }[] }[];
};

export async function getArchive(): Promise<ArchiveGroup[]> {
  const posts = await prisma.post.findMany({
    where: { status: POST_STATUS.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, publishedAt: true, createdAt: true },
  });

  const groups: ArchiveGroup[] = [];
  for (const post of posts) {
    const date = post.publishedAt ?? post.createdAt;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    let yearGroup = groups.find((g) => g.year === year);
    if (!yearGroup) {
      yearGroup = { year, months: [] };
      groups.push(yearGroup);
    }
    let monthGroup = yearGroup.months.find((m) => m.month === month);
    if (!monthGroup) {
      monthGroup = { month, posts: [] };
      yearGroup.months.push(monthGroup);
    }
    monthGroup.posts.push({
      id: post.id,
      title: post.title,
      slug: post.slug,
      publishedAt: post.publishedAt,
    });
  }

  return groups;
}

export async function getSidebarData() {
  const [categories, tags, recentPosts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: { where: { status: POST_STATUS.PUBLISHED } } } } },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: { where: { status: POST_STATUS.PUBLISHED } } } } },
    }),
    prisma.post.findMany({
      where: { status: POST_STATUS.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, publishedAt: true },
    }),
  ]);

  return { categories, tags, recentPosts };
}

/**
 * 按名称找到已有标签，不存在则创建；返回标签 id 列表。
 * 编辑器中允许直接输入新标签名。
 */
export async function resolveTagIds(names: string[]): Promise<string[]> {
  const unique = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
  const ids: string[] = [];

  for (const name of unique) {
    const slug = slugifyName(name);
    const existing = await prisma.tag.findFirst({
      where: { OR: [{ name }, { slug }] },
      select: { id: true },
    });
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const created = await prisma.tag.create({ data: { name, slug }, select: { id: true } });
    ids.push(created.id);
  }

  return ids;
}
