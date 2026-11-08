"use client";

import { useState } from "react";

type Status = { type: "idle" | "loading" | "success" | "error"; message?: string };

type Props = {
  postSlug: string;
  parentId?: string;
  replyToName?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
};

export function CommentForm({
  postSlug,
  parentId,
  replyToName,
  onCancel,
  autoFocus,
}: Props) {
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const isReply = Boolean(parentId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, parentId: parentId ?? null, author, email, content }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus({ type: "error", message: payload?.error ?? "提交失败，请稍后再试" });
        return;
      }

      setStatus({
        type: "success",
        message: payload?.message ?? (isReply ? "回复已提交，审核后显示。" : "评论已提交，审核后显示。"),
      });
      setAuthor("");
      setEmail("");
      setContent("");
    } catch {
      setStatus({ type: "error", message: "网络异常，请稍后再试" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {isReply && replyToName && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-pixel text-[9px] leading-none text-[var(--accent)]">
            REPLY TO <span className="font-sans text-xs font-bold">@{replyToName}</span>
          </p>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="border-2 border-[var(--border)] px-2 py-1 font-pixel text-[8px] leading-none text-[var(--muted)] transition-colors hover:border-[var(--ink)] hover:text-[var(--fg)]"
            >
              CANCEL
            </button>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`comment-author-${parentId ?? "root"}`}
            className="mb-1 block text-[11px] text-[var(--muted)]"
          >
            昵称 <span className="text-[var(--accent-2)]">*</span>
          </label>
          <input
            id={`comment-author-${parentId ?? "root"}`}
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
            maxLength={50}
            className="pixel-input h-9 px-2.5 text-sm"
            placeholder="怎么称呼你"
          />
        </div>
        <div>
          <label
            htmlFor={`comment-email-${parentId ?? "root"}`}
            className="mb-1 block text-[11px] text-[var(--muted)]"
          >
            邮箱（选填）
          </label>
          <input
            id={`comment-email-${parentId ?? "root"}`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={120}
            className="pixel-input h-9 px-2.5 text-sm"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`comment-content-${parentId ?? "root"}`}
          className="mb-1 block text-[11px] text-[var(--muted)]"
        >
          内容 <span className="text-[var(--accent-2)]">*</span>
        </label>
        <textarea
          id={`comment-content-${parentId ?? "root"}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={isReply ? 3 : 4}
          maxLength={2000}
          autoFocus={autoFocus}
          className="pixel-input resize-y px-2.5 py-2 text-sm"
          placeholder={isReply ? "写下你的回复…" : "说点什么吧…"}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status.type === "loading"}
          aria-label={isReply ? "提交回复" : "提交评论"}
          className="pixel-btn pixel-btn-primary h-9 px-4 font-pixel text-[9px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.type === "loading" ? "SENDING..." : isReply ? "REPLY" : "SUBMIT"}
        </button>
        {status.message && (
          <p
            className={`text-xs ${
              status.type === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
