import type { Prisma } from "@prisma/client";
import { POST_STATUS } from "./constants";

/**
 * 前台可见文章的唯一判断条件：已发布且发布时间已到。
 * 所有前台出口（页面、API、sitemap、RSS、评论校验、统计）必须使用它。
 */
export function publishedPostWhere(now: Date = new Date()): Prisma.PostWhereInput {
  return {
    status: POST_STATUS.PUBLISHED,
    publishedAt: { lte: now },
  };
}

/** 后台使用：已发布但发布时间在未来的定时文章 */
export function scheduledPostWhere(now: Date = new Date()): Prisma.PostWhereInput {
  return {
    status: POST_STATUS.PUBLISHED,
    publishedAt: { gt: now },
  };
}

export function isPubliclyPublished(
  post: { status: string; publishedAt: Date | null },
  now: Date = new Date(),
): boolean {
  return (
    post.status === POST_STATUS.PUBLISHED &&
    post.publishedAt !== null &&
    post.publishedAt.getTime() <= now.getTime()
  );
}
