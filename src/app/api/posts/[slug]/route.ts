import { jsonError, jsonOk, notFound, unauthorized, zodErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { POST_STATUS } from "@/lib/constants";
import { getPublishedPostBySlug, resolveTagIds } from "@/lib/posts";
import prisma from "@/lib/prisma";
import { postUpdateSchema } from "@/lib/validators";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return notFound("文章不存在");

  return jsonOk(post);
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { slug } = await params;
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (!existing) return notFound("文章不存在");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = postUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(zodErrorMessage(parsed.error), 422);
  }

  const input = parsed.data;

  if (input.slug && input.slug !== existing.slug) {
    const taken = await prisma.post.findUnique({ where: { slug: input.slug }, select: { id: true } });
    if (taken) return jsonError("该 slug 已被使用，请换一个", 409);
  }

  const tagIds = input.tags ? await resolveTagIds(input.tags) : undefined;
  const nextStatus = input.status ?? existing.status;

  let publishedAt = existing.publishedAt;
  if (nextStatus === POST_STATUS.PUBLISHED && !publishedAt) {
    publishedAt = new Date();
  }

  const post = await prisma.post.update({
    where: { id: existing.id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      publishedAt,
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId || null } : {}),
      ...(tagIds ? { tags: { set: tagIds.map((id) => ({ id })) } } : {}),
    },
    include: { category: true, tags: true },
  });

  return jsonOk(post);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { slug } = await params;
  const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) return notFound("文章不存在");

  await prisma.post.delete({ where: { id: existing.id } });
  return jsonOk({ id: existing.id });
}
