import { jsonError, jsonOk, unauthorized, zodErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { settingsSchema } from "@/lib/validators";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const settings = await prisma.siteSetting.findUnique({ where: { id: "site" } });
  return jsonOk(settings);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 422);

  const input = parsed.data;
  const data = {
    siteTitle: input.siteTitle,
    siteDescription: input.siteDescription,
    authorName: input.authorName,
    authorBio: input.authorBio,
    avatarUrl: input.avatarUrl || null,
    githubUrl: input.githubUrl || null,
  };

  const settings = await prisma.siteSetting.upsert({
    where: { id: "site" },
    update: data,
    create: { id: "site", ...data },
  });

  return jsonOk(settings);
}
