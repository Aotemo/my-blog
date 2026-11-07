import { jsonError, jsonOk, notFound, unauthorized, zodErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { commentModerationSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.comment.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound("评论不存在");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = commentModerationSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(zodErrorMessage(parsed.error), 422);
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { approved: parsed.data.approved },
  });

  return jsonOk(comment);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.comment.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound("评论不存在");

  await prisma.comment.delete({ where: { id } });
  return jsonOk({ id });
}
