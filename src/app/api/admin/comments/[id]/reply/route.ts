import { NextResponse } from "next/server";
import { jsonError, notFound, unauthorized, zodErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { adminReplySchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const target = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, parentId: true, author: true, postId: true },
  });
  if (!target) return notFound("评论不存在");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = adminReplySchema.safeParse(payload);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 422);

  const [settings, topLevel] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: "site" }, select: { authorName: true } }),
    target.parentId
      ? prisma.comment.findUnique({ where: { id: target.parentId }, select: { id: true } })
      : Promise.resolve({ id: target.id }),
  ]);

  if (!topLevel) return jsonError("所属评论不存在", 400);

  const reply = await prisma.comment.create({
    data: {
      postId: target.postId,
      parentId: topLevel.id,
      replyToName: target.author,
      author: settings?.authorName?.trim() || "博主",
      email: null,
      content: parsed.data.content,
      approved: true,
      isAdmin: true,
    },
    select: {
      id: true,
      author: true,
      content: true,
      approved: true,
      isAdmin: true,
      parentId: true,
      replyToName: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, data: reply }, { status: 201 });
}
