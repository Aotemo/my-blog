import { jsonError, jsonOk, zodErrorMessage } from "@/lib/api";
import { createSessionCookie, verifyCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) return jsonError(zodErrorMessage(parsed.error), 422);

  const user = await verifyCredentials(parsed.data.username, parsed.data.password);
  if (!user) return jsonError("用户名或密码错误", 401);

  await createSessionCookie(user.id, user.username);
  return jsonOk({ username: user.username });
}
