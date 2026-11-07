import { NextResponse } from "next/server";
import { jsonError, jsonOk, unauthorized, zodErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { PAGE_SIZE, POST_STATUS } from "@/lib/constants";
import { listPublishedPosts, resolveTagIds } from "@/lib/posts";
import prisma from "@/lib/prisma";
import { postSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? PAGE_SIZE);
  const q = searchParams.get("q")?.trim() || undefined;
  const category = searchParams.get("category")?.trim() || undefined;
  const tag = searchParams.get("tag")?.trim() || undefined;

  const result = await listPublishedPosts({
    page: Number.isFinite(page) ? page : 1,
    pageSize: Math.min(Math.max(Number.isFinite(pageSize) ? pageSize : PAGE_SIZE, 1), 50),
    categorySlug: category,
    tagSlug: tag,
    query: q,
  });

  return jsonOk(result);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = postSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(zodErrorMessage(parsed.error), 422);
  }

  const input = parsed.data;
  const slugTaken = await prisma.post.findUnique({ where: { slug: input.slug }, select: { id: true } });
  if (slugTaken) {
    return jsonError("该 slug 已被使用，请换一个", 409);
  }

  const tagIds = await resolveTagIds(input.tags);
  const published = input.status === POST_STATUS.PUBLISHED;

  const post = await prisma.post.create({
    data: {
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      coverImage: input.coverImage || null,
      status: input.status,
      publishedAt: published ? new Date() : null,
      categoryId: input.categoryId || null,
      tags: { connect: tagIds.map((id) => ({ id })) },
    },
    include: { category: true, tags: true },
  });

  return NextResponse.json({ ok: true, data: post }, { status: 201 });
}
