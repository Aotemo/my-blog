import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/post-editor";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "编辑文章",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const [post, categories, tags] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { tags: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!post) notFound();

  return (
    <PostEditor
      mode="edit"
      categories={categories}
      tags={tags}
      post={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        content: post.content,
        coverImage: post.coverImage,
        status: post.status,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        categoryId: post.categoryId,
        tags: post.tags.map((tag) => tag.name),
      }}
    />
  );
}
