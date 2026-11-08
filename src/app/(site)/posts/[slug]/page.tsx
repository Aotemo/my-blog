/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { CommentThread } from "@/components/comment-thread";
import { MarkdownArticle } from "@/components/markdown-article";
import { PixelClock, PixelEye } from "@/components/pixel-icons";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/toc";
import { formatDate, formatNumber } from "@/lib/format";
import { extractToc, readingTime } from "@/lib/markdown";
import { getAdjacentPosts, getPublishedPostBySlug, incrementViewCount } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "文章不存在" };

  return {
    title: post.title,
    description: post.summary || undefined,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary || undefined,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: (post.contentUpdatedAt ?? post.publishedAt)?.toISOString(),
      tags: post.tags.map((tag) => tag.name),
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  await incrementViewCount(post.id);
  const viewCount = post.viewCount + 1;
  const toc = extractToc(post.content);
  const adjacent = await getAdjacentPosts(post);
  const minutes = readingTime(post.content);
  const approvedComments = post.comments;
  const commentCount = approvedComments.reduce(
    (total, comment) => total + 1 + comment.replies.length,
    0,
  );
  const showUpdated =
    post.publishedAt !== null &&
    post.contentUpdatedAt !== null &&
    post.contentUpdatedAt.getTime() - post.publishedAt.getTime() > 24 * 60 * 60 * 1000;
  const threadComments = approvedComments.map((comment) => ({
    id: comment.id,
    author: comment.author,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    isAdmin: comment.isAdmin,
    replyToName: comment.replyToName,
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      author: reply.author,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      isAdmin: reply.isAdmin,
      replyToName: reply.replyToName,
      replies: [] as never[],
    })),
  }));

  return (
    <>
      <ReadingProgress />

      <div className="mx-auto w-full max-w-[680px] px-5 py-10">
        <Link
          href="/"
          className="pixel-link inline-flex items-center gap-1.5 px-1 font-pixel text-[10px] text-[var(--muted)]"
        >
          <span aria-hidden>&lt;</span> BACK
        </Link>

        <article>
          <header className="mt-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] leading-none text-[var(--muted)]">
              <time
                className="font-pixel leading-none"
                dateTime={post.publishedAt?.toISOString() ?? undefined}
              >
                {formatDate(post.publishedAt)}
              </time>

              {post.category && (
                <Link
                  href={`/categories/${post.category.slug}`}
                  className="pixel-link px-1 text-[var(--accent)]"
                >
                  [{post.category.name}]
                </Link>
              )}

              {showUpdated && (
                <span className="font-pixel leading-none text-[var(--accent-2)]">
                  UPDATED {formatDate(post.contentUpdatedAt)}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 font-pixel leading-none">
                <PixelClock className="h-3 w-3" />
                {minutes} MIN
              </span>

              <span className="inline-flex items-center gap-1.5 font-pixel leading-none">
                <PixelEye className="h-3 w-3" />
                {formatNumber(viewCount)}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>

            {post.summary && (
              <p className="mt-5 border-l-4 border-[var(--accent-2)] bg-[var(--tag-bg)] px-4 py-3 text-[15px] leading-[1.8] text-[var(--muted)]">
                {post.summary}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="pixel-tag text-[11px] text-[var(--fg)]"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="mt-7 w-full border-2 border-[var(--ink)] object-cover"
            />
          )}

          {toc.length > 0 && (
            <details className="mt-7 border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-3 xl:hidden">
              <summary className="flex items-center justify-between font-pixel text-[9px] leading-none">
                <span>TABLE OF CONTENTS</span>
                <span className="text-[var(--accent-2)]" aria-hidden>
                  +
                </span>
              </summary>
              <ul className="mt-3 space-y-2 border-t-2 border-dashed border-[var(--border)] pt-3 text-[13px] leading-snug">
                {toc.map((item) => (
                  <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
                    <a href={`#${item.id}`} className="pixel-link block px-1 py-0.5 text-[var(--muted)]">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="mt-8">
            <MarkdownArticle content={post.content} />
          </div>

          <nav className="mt-14 grid gap-4 border-t-2 border-[var(--ink)] pt-6 sm:grid-cols-2" aria-label="相邻文章">
            {adjacent.previous ? (
              <Link
                href={`/posts/${adjacent.previous.slug}`}
                className="border-2 border-[var(--border)] p-4 transition-colors duration-75 hover:border-[var(--ink)]"
              >
                <span className="font-pixel text-[8px] text-[var(--muted)]">&lt; PREV</span>
                <p className="mt-2 text-sm font-medium leading-snug">{adjacent.previous.title}</p>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {adjacent.next ? (
              <Link
                href={`/posts/${adjacent.next.slug}`}
                className="border-2 border-[var(--border)] p-4 text-right transition-colors duration-75 hover:border-[var(--ink)]"
              >
                <span className="font-pixel text-[8px] text-[var(--muted)]">NEXT &gt;</span>
                <p className="mt-2 text-sm font-medium leading-snug">{adjacent.next.title}</p>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
          </nav>

          <section id="comments" className="mt-14">
            <div className="flex items-center gap-3">
              <h2 className="font-pixel text-[10px] leading-none">COMMENTS</h2>
              <span className="pixel-divider flex-1" aria-hidden />
              <span className="font-pixel text-[10px] leading-none text-[var(--muted)]">
                {String(commentCount).padStart(2, "0")}
              </span>
            </div>

            <div className="mt-5">
              {threadComments.length === 0 ? (
                <p className="border-2 border-dashed border-[var(--border)] px-5 py-8 text-center text-sm text-[var(--muted)]">
                  NO COMMENTS YET / 还没有评论，来说点什么吧。
                </p>
              ) : (
                <CommentThread postSlug={post.slug} comments={threadComments} />
              )}
            </div>

            <div className="pixel-frame mt-8 p-5 sm:p-6">
              <h3 className="font-pixel text-[9px] leading-none">LEAVE A COMMENT</h3>
              <div className="mt-4">
                <CommentForm postSlug={post.slug} />
              </div>
            </div>
          </section>
        </article>
      </div>

      {toc.length > 0 && (
        <aside className="fixed left-[calc(50%+380px)] top-28 hidden w-48 xl:block" aria-label="文章目录">
          <TableOfContents items={toc} />
        </aside>
      )}
    </>
  );
}
