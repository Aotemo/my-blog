import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import prisma from "@/lib/prisma";
import { listPublishedPosts } from "@/lib/posts";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "标签不存在" };

  return {
    title: `标签：${tag.name}`,
    description: `浏览带有「${tag.name}」标签的全部文章`,
    alternates: { canonical: `/tags/${tag.slug}` },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;

  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const currentPage = Math.max(1, Number(page) || 1);
  const { posts, total, totalPages } = await listPublishedPosts({
    page: currentPage,
    tagSlug: slug,
  });

  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-10 sm:py-14">
      <Link href="/tags" className="pixel-link px-1 font-pixel text-[8px] text-[var(--muted)]">
        &lt; TAGS
      </Link>

      <p className="mt-5 font-pixel text-[8px] leading-none text-[var(--accent)]">TAG</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">#{tag.name}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {total} 篇文章</p>

      <div className="mt-4">
        {posts.length === 0 ? (
          <p className="mt-6 border-2 border-dashed border-[var(--border)] px-6 py-12 text-center font-pixel text-[10px] text-[var(--muted)]">
            NO POSTS
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <div className="mt-10">
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/tags/${slug}`} />
      </div>
    </div>
  );
}
