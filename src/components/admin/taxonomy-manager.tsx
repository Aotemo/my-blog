"use client";

import { useState } from "react";

export type TaxonomyItem = { id: string; name: string; slug: string; count: number };

type Props = {
  kind: "分类" | "标签";
  endpoint: "/api/categories" | "/api/tags";
  items: TaxonomyItem[];
};

const inputClass =
  "h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none transition focus:border-[var(--accent)]";

export function TaxonomyManager({ kind, endpoint, items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug || undefined }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "创建失败");
        return;
      }
      setItems((prev) => [...prev, { ...payload.data, count: 0 }]);
      setName("");
      setSlug("");
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: TaxonomyItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditSlug(item.slug);
    setError("");
  }

  async function saveEdit(id: string) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: editSlug || undefined }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "保存失败");
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, name: payload.data.name, slug: payload.data.slug } : item)),
      );
      setEditingId(null);
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: TaxonomyItem) {
    const extra = kind === "分类" ? "该分类下的文章会变为未分类。" : "";
    if (!window.confirm(`确定删除${kind}「${item.name}」吗？${extra}`)) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`${endpoint}/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error ?? "删除失败");
        return;
      }
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold">新建{kind}</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={50}
            placeholder={`${kind}名称`}
            className={inputClass}
          />
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="slug（留空自动生成）"
            className={`${inputClass} font-mono`}
          />
          <button
            type="submit"
            disabled={busy}
            className="h-9 shrink-0 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            添加
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {items.length === 0 ? (
          <p className="p-10 text-center text-sm text-[var(--muted)]">还没有{kind}。</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                {editingId === item.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className={`${inputClass} max-w-[220px]`}
                    />
                    <input
                      value={editSlug}
                      onChange={(event) => setEditSlug(event.target.value)}
                      className={`${inputClass} max-w-[220px] font-mono`}
                    />
                    <div className="ml-auto flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        disabled={busy}
                        className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--muted)]"
                      >
                        取消
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="font-mono text-xs text-[var(--muted)]">/{item.slug}</span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                      {item.count} 篇
                    </span>
                    <div className="ml-auto flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-md px-2 py-1 text-[var(--muted)] transition hover:text-[var(--accent)]"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        disabled={busy}
                        className="rounded-md px-2 py-1 text-[var(--muted)] transition hover:text-red-600 disabled:opacity-50"
                      >
                        删除
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
