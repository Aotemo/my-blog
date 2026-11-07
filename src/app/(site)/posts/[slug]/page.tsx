/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { MarkdownArticle } from "@/components/markdown-article";
import { TableOfContents } from "@/components/toc";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
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

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
      >
        <span aria-hidden>←</span> 返回首页
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article>
          <header className="border-b border-[var(--border)] pb-6">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--muted)]">
              <time dateTime={post.publishedAt?.toISOString() ?? undefined}>{formatDate(post.publishedAt)}</time>
              {post.category && (
                <>
                  <span className="text-[var(--border)]">/</span>
                  <Link
                    href={`/categories/${post.category.slug}`}
                    className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-medium text-[var(--accent)]"
                  >
                    {post.category.name}
                  </Link>
                </>
              )}
              <span>{minutes} 分钟阅读</span>
              <span>{formatNumber(viewCount)} 次阅读</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>

            {post.summary && (
              <p className="mt-4 border-l-2 border-[var(--accent)] pl-4 text-sm leading-relaxed text-[var(--muted)]">
                {post.summary}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="rounded-md border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
              className="mt-6 w-full rounded-2xl border border-[var(--border)] object-cover"
            />
          )}

          <div className="mt-8">
            <MarkdownArticle content={post.content} />
          </div>

          <nav className="mt-12 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
            {adjacent.previous ? (
              <Link
                href={`/posts/${adjacent.previous.slug}`}
                className="rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--accent)]"
              >
                <span className="text-xs text-[var(--muted)]">上一篇</span>
                <p className="mt-1 text-sm font-medium leading-snug">{adjacent.previous.title}</p>
              </Link>
            ) : (
              <span />
            )}
            {adjacent.next ? (
              <Link
                href={`/posts/${adjacent.next.slug}`}
                className="rounded-xl border border-[var(--border)] p-4 text-right transition hover:border-[var(--accent)]"
              >
                <span className="text-xs text-[var(--muted)]">下一篇</span>
                <p className="mt-1 text-sm font-medium leading-snug">{adjacent.next.title}</p>
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <section id="comments" className="mt-12">
            <h2 className="text-lg font-semibold tracking-tight">
              评论 <span className="text-sm font-normal text-[var(--muted)]">({approvedComments.length})</span>
            </h2>

            <div className="mt-4 space-y-3">
              {approvedComments.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
                  还没有评论，来说点什么吧。
                </p>
              ) : (
                approvedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                      <span className="font-medium text-[var(--foreground)]">{comment.author}</span>
                      <time dateTime={comment.createdAt.toISOString()}>{formatDateTime(comment.createdAt)}</time>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="mb-4 text-sm font-semibold">留下你的想法</h3>
              <CommentForm postSlug={post.slug} />
            </div>
          </section>
        </article>

        {toc.length > 0 && (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={toc} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
