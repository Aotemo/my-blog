"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { id: string; slug: string; status: string };

export function PostRowActions({ id, slug, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const published = status === "PUBLISHED";

  async function patchStatus() {
    setBusy(true);
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: published ? "DRAFT" : "PUBLISHED" }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        window.alert(payload?.error ?? "操作失败");
        return;
      }
      router.refresh();
    } catch {
      window.alert("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`确定删除「${slug}」吗？该操作不可撤销。`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        window.alert(payload?.error ?? "删除失败");
        return;
      }
      router.refresh();
    } catch {
      window.alert("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 whitespace-nowrap text-xs">
      <Link
        href={`/admin/posts/${id}/edit`}
        className="rounded-md px-2 py-1 text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--accent)]"
      >
        编辑
      </Link>
      <button
        type="button"
        onClick={patchStatus}
        disabled={busy}
        className="rounded-md px-2 py-1 text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--accent)] disabled:opacity-50"
      >
        {published ? "撤回" : "发布"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="rounded-md px-2 py-1 text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40"
      >
        删除
      </button>
    </div>
  );
}
