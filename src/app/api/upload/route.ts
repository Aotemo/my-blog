import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { jsonError, jsonOk, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE } from "@/lib/constants";

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("请求必须为 multipart/form-data");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("请选择要上传的图片");
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return jsonError("仅支持 PNG / JPEG / GIF / WebP / SVG / AVIF 图片", 415);
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return jsonError("图片不能超过 5MB", 413);
  }

  const extension = EXTENSION_BY_TYPE[file.type] ?? path.extname(file.name) ?? "";
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);
  } catch {
    return jsonError("保存图片失败，请稍后重试", 500);
  }

  return jsonOk({ url: `/uploads/${fileName}`, name: file.name, size: file.size });
}
