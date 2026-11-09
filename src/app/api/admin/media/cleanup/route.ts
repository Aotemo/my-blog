import { jsonError, jsonOk, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { cleanupOrphanMedia } from "@/lib/media";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("请求体必须是合法的 JSON");
  }

  const dryRun = (payload as { dryRun?: unknown } | null)?.dryRun;
  if (typeof dryRun !== "boolean") {
    return jsonError("dryRun 必须是布尔值", 422);
  }

  try {
    const result = await cleanupOrphanMedia(dryRun);
    return jsonOk(result);
  } catch (error) {
    console.error("[media] cleanup failed:", error);
    return jsonError("清理失败，请稍后再试", 500);
  }
}
