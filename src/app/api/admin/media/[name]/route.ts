import { jsonError, jsonOk, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { deleteMediaFile, isValidMediaName } from "@/lib/media";

type Params = { params: Promise<{ name: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { name } = await params;
  if (!isValidMediaName(name)) return jsonError("文件名不合法", 400);

  const { searchParams } = new URL(request.url);
  const force = ["1", "true"].includes(searchParams.get("force") ?? "");

  try {
    const result = await deleteMediaFile(name, force);
    if (!result.ok) {
      return jsonError(
        result.error,
        result.status,
        result.references ? { references: result.references } : undefined,
      );
    }
    return jsonOk({ deleted: name });
  } catch (error) {
    console.error("[media] delete failed:", error);
    return jsonError("删除失败，请稍后再试", 500);
  }
}
