"use client";

import { useState } from "react";
import { CommentForm } from "@/components/comment-form";
import { formatDateTime } from "@/lib/format";

export type ThreadComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isAdmin: boolean;
  replyToName: string | null;
  replies: ThreadComment[];
};

type ReplyTarget = { id: string; author: string } | null;

function AuthorBadge() {
  return (
    <span
      className="inline-flex items-center border-2 border-[var(--ink)] bg-[var(--accent)] px-1.5 py-0.5 font-pixel text-[8px] leading-none text-[var(--bg)]"
      title="博主"
    >
      AUTHOR
    </span>
  );
}

function ReplyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-2 border-[var(--border)] px-2 py-1 font-pixel text-[8px] leading-none text-[var(--muted)] transition-colors duration-75 hover:border-[var(--accent-2)] hover:text-[var(--accent)]"
    >
      REPLY
    </button>
  );
}

export function CommentThread({
  postSlug,
  comments,
}: {
  postSlug: string;
  comments: ThreadComment[];
}) {
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);

  function toggleReply(id: string, author: string) {
    setReplyTarget((current) => (current?.id === id ? null : { id, author }));
  }

  function closeReply() {
    setReplyTarget(null);
  }

  function renderForm(targetId: string, targetAuthor: string) {
    return (
      <div className="mt-3 border-2 border-[var(--ink)] bg-[var(--surface)] p-3 sm:p-4">
        <CommentForm
          postSlug={postSlug}
          parentId={targetId}
          replyToName={targetAuthor}
          onCancel={closeReply}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div>
      {comments.map((comment) => (
        <article key={comment.id} className="border-b-2 border-dashed border-[var(--border)] py-5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span className="text-sm font-bold">{comment.author}</span>
            {comment.isAdmin && <AuthorBadge />}
            <time
              className="font-pixel text-[8px] leading-none text-[var(--muted)]"
              dateTime={comment.createdAt}
            >
              {formatDateTime(comment.createdAt)}
            </time>
            <span className="ml-auto">
              <ReplyButton onClick={() => toggleReply(comment.id, comment.author)} />
            </span>
          </div>

          <p className="mt-2 whitespace-pre-line text-[15px] leading-[1.8]">{comment.content}</p>

          {replyTarget?.id === comment.id && renderForm(comment.id, comment.author)}

          {comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-dashed border-[var(--border)] pl-3 sm:pl-4">
              {comment.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={
                    reply.isAdmin
                      ? "border-2 border-[var(--border)] bg-[var(--accent-soft)] p-3"
                      : "border-l-2 border-[var(--border)] pl-3"
                  }
                >
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="text-sm font-bold">{reply.author}</span>
                    {reply.isAdmin && <AuthorBadge />}
                    {reply.replyToName && (
                      <span className="text-xs text-[var(--accent)]">@{reply.replyToName}</span>
                    )}
                    <time
                      className="font-pixel text-[8px] leading-none text-[var(--muted)]"
                      dateTime={reply.createdAt}
                    >
                      {formatDateTime(reply.createdAt)}
                    </time>
                    <span className="ml-auto">
                      <ReplyButton onClick={() => toggleReply(reply.id, reply.author)} />
                    </span>
                  </div>

                  <p className="mt-1.5 whitespace-pre-line text-[15px] leading-[1.8]">{reply.content}</p>

                  {replyTarget?.id === reply.id && renderForm(reply.id, reply.author)}
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
