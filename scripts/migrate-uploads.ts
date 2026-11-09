import path from "path";
import { copyFile, mkdir, readdir, rename, stat, unlink } from "fs/promises";
import { getUploadsDir } from "../src/lib/uploads";

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const sourceDir = path.resolve(process.cwd(), "public", "uploads");
  const targetDir = getUploadsDir();

  if (sourceDir === targetDir) {
    console.log("UPLOAD_DIR 指向 public/uploads，无需迁移。");
    return;
  }

  let entries;
  try {
    entries = await readdir(sourceDir, { withFileTypes: true });
  } catch {
    console.log("public/uploads 不存在，无需迁移。");
    return;
  }

  const files = entries.filter(
    (entry) => entry.isFile() && entry.name !== ".gitkeep",
  );

  if (files.length === 0) {
    console.log("public/uploads 中没有需要迁移的文件。");
    return;
  }

  await mkdir(targetDir, { recursive: true });

  let moved = 0;
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file.name);
    const targetPath = path.join(targetDir, file.name);

    if (await exists(targetPath)) {
      skipped.push(file.name);
      continue;
    }

    try {
      try {
        await rename(sourcePath, targetPath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EXDEV") throw error;
        await copyFile(sourcePath, targetPath);
        await unlink(sourcePath);
      }
      moved += 1;
    } catch (error) {
      failed.push(`${file.name}: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  console.log(`上传目录：${sourceDir} → ${targetDir}`);
  console.log(`已移动 ${moved} 个文件。`);
  if (skipped.length > 0) {
    console.log(`跳过 ${skipped.length} 个同名文件：${skipped.join("、")}`);
  }
  if (failed.length > 0) {
    console.log(`失败 ${failed.length} 个文件：`);
    for (const item of failed) console.log(`- ${item}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
