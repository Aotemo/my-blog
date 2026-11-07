import { jsonError, jsonOk, notFound, unauthorized, zodErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugifyName } from "@/lib/slug";
import { tagSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) return notFound("标签不存在");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = tagSchema.safeParse(payload);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 422);

  const name = parsed.data.name;
  const slug = parsed.data.slug || slugifyName(name);

  const conflict = await prisma.tag.findFirst({
    where: { id: { not: id }, OR: [{ name }, { slug }] },
    select: { id: true },
  });
  if (conflict) return jsonError("标签名称或 slug 已存在", 409);

  const tag = await prisma.tag.update({ where: { id }, data: { name, slug } });
  return jsonOk(tag);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.tag.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound("标签不存在");

  await prisma.tag.delete({ where: { id } });
  return jsonOk({ id });
}
