import { NextResponse } from "next/server";
import { jsonError, zodErrorMessage } from "@/lib/api";
import { POST_STATUS } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { commentSchema } from "@/lib/validators";

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
    where: { slug: input.postSlug, status: POST_STATUS.PUBLISHED },
    select: { id: true },
  });
  if (!post) return jsonError("文章不存在或未发布", 404);

  const comment = await prisma.comment.create({
    data: {
      postId: post.id,
      author: input.author,
      email: input.email || null,
      content: input.content,
      approved: false,
    },
    select: { id: true, createdAt: true, approved: true },
  });

  return NextResponse.json(
    { ok: true, data: comment, message: "评论已提交，审核通过后展示" },
    { status: 201 },
  );
}
