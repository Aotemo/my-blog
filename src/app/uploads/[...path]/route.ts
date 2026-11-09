import { readFile } from "fs/promises";
import path from "path";
import { getUploadsDir } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

type Params = { params: Promise<{ path: string[] }> };

/**
 * 运行时读取上传目录（默认 storage/uploads）下的文件。
 * 这样 `next start` 启动后新上传的图片无需重启即可访问。
 */
export async function GET(_request: Request, { params }: Params) {
  const { path: segments } = await params;
  const uploadDir = getUploadsDir();
  const filePath = path.resolve(uploadDir, ...segments);

  if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
    return new Response("Not found", { status: 404 });
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
