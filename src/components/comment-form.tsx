"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = { type: "idle" | "loading" | "success" | "error"; message?: string };

export function CommentForm({ postSlug }: { postSlug: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, author, email, content }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus({ type: "error", message: payload?.error ?? "提交失败，请稍后再试" });
        return;
      }

      setStatus({ type: "success", message: "评论已提交，审核通过后会显示在这里。" });
      setAuthor("");
      setEmail("");
      setContent("");
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "网络异常，请稍后再试" });
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="comment-author" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            昵称 <span className="text-red-500">*</span>
          </label>
          <input
            id="comment-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
            maxLength={50}
            className={inputClass}
            placeholder="怎么称呼你"
          />
        </div>
        <div>
          <label htmlFor="comment-email" className="mb-1 block text-xs font-medium text-[var(--muted)]">
            邮箱（选填，不会公开）
          </label>
          <input
            id="comment-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={120}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="comment-content" className="mb-1 block text-xs font-medium text-[var(--muted)]">
          评论内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={4}
          maxLength={2000}
          className={`${inputClass} resize-y`}
          placeholder="说点什么吧…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status.type === "loading"}
          className="inline-flex h-10 items-center rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.type === "loading" ? "提交中…" : "提交评论"}
        </button>
        {status.message && (
          <p
            className={`text-sm ${status.type === "error" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}
          >
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
