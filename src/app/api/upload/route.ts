import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { jsonError, jsonOk, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE } from "@/lib/constants";

type ImageSignature = { mime: string; extension: string };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWithBytes(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

/**
 * 根据文件头魔数识别图片格式，不信任客户端提供的 MIME 类型与文件名。
 */
function detectImageType(buffer: Buffer): ImageSignature | null {
  if (startsWithBytes(buffer, PNG_SIGNATURE)) {
    return { mime: "image/png", extension: ".png" };
  }

  if (startsWithBytes(buffer, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", extension: ".jpg" };
  }

  if (buffer.length >= 6) {
    const header = buffer.subarray(0, 6).toString("ascii");
    if (header === "GIF87a" || header === "GIF89a") {
      return { mime: "image/gif", extension: ".gif" };
    }
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", extension: ".webp" };
  }

  return null;
}

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

  if (file.size === 0) {
    return jsonError("不能上传空文件");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return jsonError("图片不能超过 5MB", 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);

  if (!detected || !ALLOWED_IMAGE_TYPES.includes(detected.mime)) {
    return jsonError("仅支持 PNG / JPEG / GIF / WebP 图片（会校验文件内容）", 415);
  }

  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}${detected.extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
  } catch {
    return jsonError("保存图片失败，请稍后重试", 500);
  }

  return jsonOk({ url: `/uploads/${fileName}`, name: file.name, size: file.size, type: detected.mime });
}
