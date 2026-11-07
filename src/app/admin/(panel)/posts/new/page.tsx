import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/post-editor";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "新建文章",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return <PostEditor mode="create" categories={categories} tags={tags} />;
}
