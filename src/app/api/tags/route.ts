import { NextResponse } from "next/server";
import { jsonError, jsonOk, unauthorized, zodErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { publishedPostWhere } from "@/lib/visibility";
import prisma from "@/lib/prisma";
import { slugifyName } from "@/lib/slug";
import { tagSchema } from "@/lib/validators";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: { where: publishedPostWhere() } } },
    },
  });
  return jsonOk(tags);
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

  const parsed = tagSchema.safeParse(payload);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 422);

  const { name } = parsed.data;
  const slug = parsed.data.slug || slugifyName(name);

  const exists = await prisma.tag.findFirst({
    where: { OR: [{ name }, { slug }] },
    select: { id: true },
  });
  if (exists) return jsonError("标签名称或 slug 已存在", 409);

  const tag = await prisma.tag.create({ data: { name, slug } });
  return NextResponse.json({ ok: true, data: tag }, { status: 201 });
}
