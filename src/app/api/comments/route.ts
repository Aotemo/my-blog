import { NextResponse } from "next/server";
import { jsonError, zodErrorMessage } from "@/lib/api";
import prisma from "@/lib/prisma";
import { commentSchema } from "@/lib/validators";
import { publishedPostWhere } from "@/lib/visibility";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = commentSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(zodErrorMessage(parsed.error), 422);
  }

  const input = parsed.data;
  const post = await prisma.post.findFirst({
    where: { slug: input.postSlug, ...publishedPostWhere() },
    select: { id: true },
  });
  if (!post) return jsonError("文章不存在或未发布", 404);

  let parentId: string | null = null;
  let replyToName: string | null = null;

  if (input.parentId) {
    const target = await prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { id: true, postId: true, parentId: true, author: true, approved: true },
    });

    if (!target) return jsonError("被回复的评论不存在", 404);
    if (target.postId !== post.id) return jsonError("不能回复其他文章的评论", 400);
    if (!target.approved) return jsonError("只能回复已审核的评论", 400);

    if (target.parentId) {
      const root = await prisma.comment.findUnique({
        where: { id: target.parentId },
        select: { id: true, approved: true },
      });
      if (!root || !root.approved) {
        return jsonError("所属评论尚未审核，暂时不能回复", 400);
      }
      parentId = root.id;
    } else {
      parentId = target.id;
    }

    replyToName = target.author;
  }

  const comment = await prisma.comment.create({
    data: {
      postId: post.id,
      parentId,
      replyToName,
      author: input.author,
      email: input.email || null,
      content: input.content,
      approved: false,
      isAdmin: false,
    },
    select: { id: true, createdAt: true, approved: true, parentId: true, replyToName: true },
  });

  return NextResponse.json(
    {
      ok: true,
      data: comment,
      message: parentId ? "回复已提交，审核通过后展示" : "评论已提交，审核通过后展示",
    },
    { status: 201 },
  );
}
