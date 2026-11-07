import type { Metadata } from "next";
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
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "分类不存在" };

  return {
    title: `分类：${category.name}`,
    description: `浏览「${category.name}」分类下的全部文章`,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const currentPage = Math.max(1, Number(page) || 1);
  const { posts, total, totalPages } = await listPublishedPosts({
    page: currentPage,
    categorySlug: slug,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Category</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{category.name}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {total} 篇文章</p>

      <div className="mt-8 space-y-4">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            该分类下还没有已发布的文章。
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/categories/${slug}`}
      />
    </div>
  );
}
