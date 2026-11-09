import path from "path";

/**
 * 上传文件根目录。默认放在 public 之外，避免 `next start` 缓存静态文件列表
 * 导致删除后的旧文件仍被处理（返回 400 而不是 404）。
 */
export function getUploadsDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  return configured
    ? path.resolve(process.cwd(), configured)
    : path.join(process.cwd(), "storage", "uploads");
}
