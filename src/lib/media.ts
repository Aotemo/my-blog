import path from "path";
import { readdir, stat, unlink } from "fs/promises";
import prisma from "./prisma";
import { getUploadsDir } from "./uploads";

const SAFE_NAME = /^[A-Za-z0-9._-]+$/;
const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000;

export type MediaReference = {
  type: "content" | "cover" | "avatar";
  label: string;
  href: string;
  postId?: string;
  postTitle?: string;
};

export type MediaFile = {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
  references: MediaReference[];
};

export type MediaSummary = {
  totalCount: number;
  totalSize: number;
  unusedCount: number;
  unusedSize: number;
};

export type MediaFilter = "all" | "used" | "unused";

export type MediaLibrary = {
  files: MediaFile[];
  summary: MediaSummary;
};

type ReferenceSource = {
  posts: { id: string; title: string; content: string; coverImage: string | null }[];
  avatarUrl: string | null;
};

type RawFile = {
  name: string;
  size: number;
  modifiedAt: string;
  mtimeMs: number;
};

export function isValidMediaName(name: string): boolean {
  return (
    SAFE_NAME.test(name) &&
    name.length <= 255 &&
    !name.includes("..") &&
    !name.startsWith(".") &&
    name !== ".gitkeep"
  );
}

function resolveMediaPath(name: string): string | null {
  if (!isValidMediaName(name)) return null;
  const uploadDir = getUploadsDir();
  const filePath = path.resolve(uploadDir, name);
  if (path.dirname(filePath) !== uploadDir) return null;
  if (path.basename(filePath) !== name) return null;
  return filePath;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMatcher(name: string): RegExp {
  return new RegExp(`/uploads/${escapeRegExp(name)}(?![A-Za-z0-9._-])`);
}

async function loadReferenceSource(): Promise<ReferenceSource> {
  const [posts, settings] = await Promise.all([
    prisma.post.findMany({
      select: { id: true, title: true, content: true, coverImage: true },
    }),
    prisma.siteSetting.findUnique({
      where: { id: "site" },
      select: { avatarUrl: true },
    }),
  ]);

  return { posts, avatarUrl: settings?.avatarUrl ?? null };
}

function findReferences(name: string, source: ReferenceSource): MediaReference[] {
  const matcher = buildMatcher(name);
  const references: MediaReference[] = [];
  const editHref = (id: string) => `/admin/posts/${id}/edit`;

  for (const post of source.posts) {
    if (matcher.test(post.content)) {
      references.push({
        type: "content",
        label: `正文 · ${post.title}`,
        href: editHref(post.id),
        postId: post.id,
        postTitle: post.title,
      });
    }
    if (post.coverImage && matcher.test(post.coverImage)) {
      references.push({
        type: "cover",
        label: `封面 · ${post.title}`,
        href: editHref(post.id),
        postId: post.id,
        postTitle: post.title,
      });
    }
  }

  if (source.avatarUrl && matcher.test(source.avatarUrl)) {
    references.push({
      type: "avatar",
      label: "站点头像",
      href: "/admin/settings",
    });
  }

  return references;
}

async function readRawFiles(): Promise<RawFile[]> {
  const uploadDir = getUploadsDir();
  let entries;
  try {
    entries = await readdir(uploadDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map(async (entry) => {
        const filePath = path.join(uploadDir, entry.name);
        try {
          const info = await stat(filePath);
          return {
            name: entry.name,
            size: info.size,
            modifiedAt: info.mtime.toISOString(),
            mtimeMs: info.mtimeMs,
          };
        } catch {
          return null;
        }
      }),
  );

  return files
    .filter((file): file is RawFile => Boolean(file))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
}

async function loadAllFiles(): Promise<MediaFile[]> {
  const [rawFiles, source] = await Promise.all([readRawFiles(), loadReferenceSource()]);

  return rawFiles.map((file) => ({
    name: file.name,
    url: `/uploads/${encodeURIComponent(file.name)}`,
    size: file.size,
    modifiedAt: file.modifiedAt,
    references: findReferences(file.name, source),
  }));
}

function summarize(files: MediaFile[]): MediaSummary {
  const unused = files.filter((file) => file.references.length === 0);
  return {
    totalCount: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    unusedCount: unused.length,
    unusedSize: unused.reduce((sum, file) => sum + file.size, 0),
  };
}

export async function getMediaLibrary(filter: MediaFilter = "all"): Promise<MediaLibrary> {
  const files = await loadAllFiles();
  const filtered =
    filter === "used"
      ? files.filter((file) => file.references.length > 0)
      : filter === "unused"
        ? files.filter((file) => file.references.length === 0)
        : files;

  return {
    files: filtered,
    summary: summarize(files),
  };
}

export async function findMediaReferences(name: string): Promise<MediaReference[]> {
  const source = await loadReferenceSource();
  return findReferences(name, source);
}

export type DeleteMediaResult =
  | { ok: true }
  | { ok: false; status: 400 | 404 | 409 | 500; error: string; references?: MediaReference[] };

export async function deleteMediaFile(name: string, force: boolean): Promise<DeleteMediaResult> {
  const filePath = resolveMediaPath(name);
  if (!filePath) {
    return { ok: false, status: 400, error: "文件名不合法" };
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return { ok: false, status: 404, error: "文件不存在" };
    }
  } catch {
    return { ok: false, status: 404, error: "文件不存在" };
  }

  const references = await findMediaReferences(name);
  if (references.length > 0 && !force) {
    return {
      ok: false,
      status: 409,
      error: "图片仍被引用，确认后可强制删除",
      references,
    };
  }

  try {
    await unlink(filePath);
  } catch (error) {
    return {
      ok: false,
      status: 500,
      error: `删除失败：${error instanceof Error ? error.message : "未知错误"}`,
    };
  }

  return { ok: true };
}

export type OrphanCandidate = {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
};

export type CleanupResult = {
  dryRun: boolean;
  count: number;
  totalSize: number;
  files: OrphanCandidate[];
  deleted: string[];
  failures: { name: string; error: string }[];
};

export async function cleanupOrphanMedia(dryRun: boolean): Promise<CleanupResult> {
  const files = await loadAllFiles();
  const cutoff = Date.now() - ORPHAN_MIN_AGE_MS;
  const candidates = files
    .filter(
      (file) =>
        file.references.length === 0 && new Date(file.modifiedAt).getTime() < cutoff,
    )
    .sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime());

  const candidateData: OrphanCandidate[] = candidates.map((file) => ({
    name: file.name,
    url: file.url,
    size: file.size,
    modifiedAt: file.modifiedAt,
  }));

  if (dryRun) {
    return {
      dryRun: true,
      count: candidateData.length,
      totalSize: candidateData.reduce((sum, file) => sum + file.size, 0),
      files: candidateData,
      deleted: [],
      failures: [],
    };
  }

  const deleted: string[] = [];
  const failures: { name: string; error: string }[] = [];
  let deletedSize = 0;

  for (const file of candidates) {
    const filePath = resolveMediaPath(file.name);
    if (!filePath) {
      failures.push({ name: file.name, error: "文件名不合法" });
      continue;
    }
    try {
      await unlink(filePath);
      deleted.push(file.name);
      deletedSize += file.size;
    } catch (error) {
      failures.push({
        name: file.name,
        error: error instanceof Error ? error.message : "删除失败",
      });
    }
  }

  return {
    dryRun: false,
    count: deleted.length,
    totalSize: deletedSize,
    files: candidateData.filter((file) => deleted.includes(file.name)),
    deleted,
    failures,
  };
}
