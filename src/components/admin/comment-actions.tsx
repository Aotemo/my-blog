"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { id: string; approved: boolean; parentApproved?: boolean };

export function CommentActions({ id, approved, parentApproved }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setApproved(next: boolean) {
    if (next && parentApproved === false) {
      const confirmed = window.confirm(
        "该回复的顶级评论尚未审核，通过后回复仍不会在前台显示。仍要通过吗？",
      );
      if (!confirmed) return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: next }),
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
    if (!window.confirm("确定删除这条评论吗？")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/comments/${id}`, { method: "DELETE" });
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
    <div className="flex items-center gap-2 text-xs">
      {approved ? (
        <button
          type="button"
          onClick={() => setApproved(false)}
          disabled={busy}
          className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[var(--muted)] transition hover:border-amber-500 hover:text-amber-600 disabled:opacity-50"
        >
          撤销通过
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setApproved(true)}
          disabled={busy}
          className="rounded-md bg-emerald-600 px-2.5 py-1 text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          通过
        </button>
      )}
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="rounded-md px-2 py-1 text-[var(--muted)] transition hover:text-red-600 disabled:opacity-50"
      >
        删除
      </button>
    </div>
  );
}
