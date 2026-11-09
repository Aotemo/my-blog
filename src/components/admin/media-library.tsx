"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateTime } from "@/lib/format";
import type {
  CleanupResult,
  MediaFile,
  MediaFilter,
  MediaReference,
  MediaSummary,
} from "@/lib/media";

type Props = {
  files: MediaFile[];
  summary: MediaSummary;
  filter: MediaFilter;
};

const FILTERS: { value: MediaFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "used", label: "已引用" },
  { value: "unused", label: "未引用" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

export function MediaLibrary({ files, summary, filter }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(60);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [cleanup, setCleanup] = useState<
    { phase: "preview"; preview: CleanupResult } | { phase: "result"; result: CleanupResult } | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const shown = files.slice(0, visible);

  async function copyLink(file: MediaFile) {
    try {
      const absolute = new URL(file.url, window.location.origin).toString();
      await navigator.clipboard.writeText(absolute);
      setCopied(file.name);
      window.setTimeout(() => setCopied((current) => (current === file.name ? null : current)), 1500);
    } catch {
      setMessage({ type: "error", text: "复制失败，请手动复制图片地址" });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const force = target.references.length > 0;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/admin/media/${encodeURIComponent(target.name)}${force ? "?force=1" : ""}`,
        { method: "DELETE" },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409 && Array.isArray(payload?.references)) {
          setDeleteTarget({ ...target, references: payload.references as MediaReference[] });
          setMessage({ type: "error", text: "引用情况已更新，请确认后重试" });
          return;
        }
        setMessage({ type: "error", text: payload?.error ?? "删除失败" });
        return;
      }

      setDeleteTarget(null);
      setMessage({ type: "success", text: `已删除 ${target.name}` });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "网络异常，请稍后再试" });
    } finally {
      setBusy(false);
    }
  }

  async function requestCleanup() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/media/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: true }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage({ type: "error", text: payload?.error ?? "读取清理清单失败" });
        return;
      }
      setCleanup({ phase: "preview", preview: payload.data as CleanupResult });
    } catch {
      setMessage({ type: "error", text: "网络异常，请稍后再试" });
    } finally {
      setBusy(false);
    }
  }

  async function confirmCleanup() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/media/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: false }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage({ type: "error", text: payload?.error ?? "清理失败" });
        return;
      }
      setCleanup({ phase: "result", result: payload.data as CleanupResult });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "网络异常，请稍后再试" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">媒体库</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            管理上传目录中的图片与引用情况。
          </p>
        </div>
        <button
          type="button"
          onClick={requestCleanup}
          disabled={busy}
          className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
        >
          清理孤儿图片
        </button>
      </div>

      {message && (
        <p
          className={`rounded-lg border px-4 py-2.5 text-sm ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
          }`}
        >
          {message.text}
        </p>
      )}

      <p className="text-xs text-[var(--muted)]">删除后 CDN 缓存可能延迟失效。</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="文件总数" value={String(summary.totalCount)} />
        <StatCard label="总大小" value={formatBytes(summary.totalSize)} />
        <StatCard label="未引用" value={String(summary.unusedCount)} hint="可安全删除" />
        <StatCard label="未引用大小" value={formatBytes(summary.unusedSize)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {FILTERS.map((item) => (
            <Link
              key={item.value}
              href={`/admin/media?filter=${item.value}`}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                filter === item.value
                  ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)]">
          当前显示 {shown.length} / {files.length} 个文件
        </p>
      </div>

      {files.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
          没有符合条件的图片。
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((file) => (
            <article
              key={file.name}
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="flex h-36 items-center justify-center border-b border-[var(--border)] bg-[var(--background)] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="break-all text-sm font-medium">{file.name}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  {formatBytes(file.size)} · {formatDateTime(file.modifiedAt)}
                </p>

                {file.references.length > 0 ? (
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((current) => (current === file.name ? null : file.name))
                      }
                      className="text-xs text-[var(--accent)] transition hover:underline"
                    >
                      被 {file.references.length} 处引用
                    </button>
                    {expanded === file.name && (
                      <ul className="mt-1.5 space-y-1 text-xs text-[var(--muted)]">
                        {file.references.map((reference, index) => (
                          <li key={`${reference.type}-${index}`}>
                            <Link
                              href={reference.href}
                              className="transition hover:text-[var(--accent)] hover:underline"
                            >
                              {reference.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted)]">未引用</p>
                )}

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => copyLink(file)}
                    className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {copied === file.name ? "已复制" : "复制链接"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(file)}
                    className="rounded-md px-2.5 py-1 text-xs text-[var(--muted)] transition hover:text-red-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {files.length > visible && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((count) => count + 60)}
            className="h-9 rounded-lg border border-[var(--border)] px-4 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            加载更多（剩余 {files.length - visible}）
          </button>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="确认删除图片"
        >
          <div className="admin-ui w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-semibold">删除图片？</h2>
            <p className="mt-2 break-all text-sm text-[var(--muted)]">{deleteTarget.name}</p>

            {deleteTarget.references.length > 0 ? (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <p>以下位置正在引用这张图片，删除后会显示破图：</p>
                <ul className="mt-2 space-y-1">
                  {deleteTarget.references.map((reference, index) => (
                    <li key={`${reference.type}-${index}`}>
                      <Link href={reference.href} className="underline">
                        {reference.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">删除后无法恢复。</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={busy}
                className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--muted)]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busy}
                className="h-9 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {busy ? "删除中…" : deleteTarget.references.length > 0 ? "仍要删除" : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cleanup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="清理孤儿图片"
        >
          <div className="admin-ui w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            {cleanup.phase === "preview" ? (
              <>
                <h2 className="text-lg font-semibold">清理孤儿图片</h2>
                {cleanup.preview.count === 0 ? (
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    没有可清理的孤儿图片。只会清理 24 小时前上传且未被引用的文件。
                  </p>
                ) : (
                  <>
                    <p className="mt-3 text-sm">
                      将删除 <strong>{cleanup.preview.count}</strong> 张图片，共{" "}
                      <strong>{formatBytes(cleanup.preview.totalSize)}</strong>。
                    </p>
                    <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-xs text-[var(--muted)]">
                      {cleanup.preview.files.slice(0, 20).map((file) => (
                        <li key={file.name} className="break-all">
                          {file.name} · {formatBytes(file.size)}
                        </li>
                      ))}
                    </ul>
                    {cleanup.preview.files.length > 20 && (
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        还有 {cleanup.preview.files.length - 20} 个文件未列出…
                      </p>
                    )}
                  </>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCleanup(null)}
                    disabled={busy}
                    className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--muted)]"
                  >
                    取消
                  </button>
                  {cleanup.preview.count > 0 && (
                    <button
                      type="button"
                      onClick={confirmCleanup}
                      disabled={busy}
                      className="h-9 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
                    >
                      {busy ? "清理中…" : "确认清理"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold">清理完成</h2>
                <p className="mt-3 text-sm">
                  已清理 <strong>{cleanup.result.count}</strong> 张图片，释放{" "}
                  <strong>{formatBytes(cleanup.result.totalSize)}</strong>。
                </p>
                {cleanup.result.failures.length > 0 && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {cleanup.result.failures.length} 个文件删除失败：
                    {cleanup.result.failures.map((failure) => failure.name).join("、")}
                  </p>
                )}
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCleanup(null)}
                    className="h-9 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white"
                  >
                    关闭
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
