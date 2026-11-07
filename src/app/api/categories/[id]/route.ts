import { jsonError, jsonOk, notFound, unauthorized, zodErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugifyName } from "@/lib/slug";
import { categorySchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return notFound("分类不存在");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 422);

  const name = parsed.data.name;
  const slug = parsed.data.slug || slugifyName(name);

  const conflict = await prisma.category.findFirst({
    where: { id: { not: id }, OR: [{ name }, { slug }] },
    select: { id: true },
  });
  if (conflict) return jsonError("分类名称或 slug 已存在", 409);

  const category = await prisma.category.update({ where: { id }, data: { name, slug } });
  return jsonOk(category);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound("分类不存在");

  // schema 中 Post.category 关系为 onDelete: SetNull，删除后文章归为未分类
  await prisma.category.delete({ where: { id } });
  return jsonOk({ id });
}
