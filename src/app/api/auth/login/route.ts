import { jsonError, jsonOk, zodErrorMessage } from "@/lib/api";
import { createSessionCookie, verifyCredentials } from "@/lib/auth";
import { JwtConfigError } from "@/lib/jwt";
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

  try {
    await createSessionCookie(user.id, user.username);
  } catch (error) {
    if (error instanceof JwtConfigError) {
      return jsonError(error.message, 500);
    }
    throw error;
  }

  return jsonOk({ username: user.username });
}
