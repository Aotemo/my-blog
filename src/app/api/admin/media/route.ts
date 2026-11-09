import { jsonError, jsonOk, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getMediaLibrary, type MediaFilter } from "@/lib/media";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const rawFilter = searchParams.get("filter");
  const filter: MediaFilter =
    rawFilter === "used" || rawFilter === "unused" ? rawFilter : "all";

  try {
    const library = await getMediaLibrary(filter);
    return jsonOk(library);
  } catch (error) {
    console.error("[media] list failed:", error);
    return jsonError("读取媒体库失败", 500);
  }
}
