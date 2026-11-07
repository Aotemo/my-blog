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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="comment-author" className="mb-1.5 block text-[11px] tracking-wide text-[var(--muted)]">
            昵称 <span className="text-[var(--accent-2)]">*</span>
          </label>
          <input
            id="comment-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
            maxLength={50}
            className="pixel-input h-10 px-3 text-sm"
            placeholder="怎么称呼你"
          />
        </div>
        <div>
          <label htmlFor="comment-email" className="mb-1.5 block text-[11px] tracking-wide text-[var(--muted)]">
            邮箱（选填，不会公开）
          </label>
          <input
            id="comment-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={120}
            className="pixel-input h-10 px-3 text-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="comment-content" className="mb-1.5 block text-[11px] tracking-wide text-[var(--muted)]">
          评论内容 <span className="text-[var(--accent-2)]">*</span>
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={4}
          maxLength={2000}
          className="pixel-input resize-y px-3 py-2 text-sm"
          placeholder="说点什么吧…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.type === "loading"}
          aria-label="提交评论"
          className="pixel-btn pixel-btn-primary h-10 px-5 font-pixel text-[10px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.type === "loading" ? "SENDING..." : "SUBMIT"}
        </button>
        {status.message && (
          <p
            className={`text-sm ${
              status.type === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
