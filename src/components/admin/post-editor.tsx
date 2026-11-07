"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { MarkdownArticle } from "@/components/markdown-article";
import { slugify } from "@/lib/slug";

export type EditorPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  status: string;
  categoryId: string | null;
  tags: string[];
};

type Option = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  post?: EditorPost;
  categories: Option[];
  tags: Option[];
};

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none transition focus:border-[var(--accent)]";

export function PostEditor({ mode, post, categories, tags }: Props) {
  const router = useRouter();

  const initialSlug = post?.slug ?? "";
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [status, setStatus] = useState(post?.status ?? "DRAFT");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags ?? []);
  const [tagOptions, setTagOptions] = useState<Option[]>(tags);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = useMemo(() => content.replace(/\s/g, "").length, [content]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function addTag(name: string) {
    const value = name.trim().replace(/^#/, "");
    if (!value) return;
    if (selectedTags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setTagInput("");
      return;
    }
    setSelectedTags((prev) => [...prev, value]);
    setTagOptions((prev) => {
      if (prev.some((tag) => tag.name.toLowerCase() === value.toLowerCase())) return prev;
      return [...prev, { id: `new-${value}`, name: value }];
    });
    setTagInput("");
  }

  function removeTag(name: string) {
    setSelectedTags((prev) => prev.filter((tag) => tag !== name));
  }

  function insertText(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}\n${snippet}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${content.slice(0, start)}${snippet}${content.slice(end)}`;
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
    });
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? "上传失败");
        return;
      }
      insertText(`![${file.name.replace(/\.[^.]+$/, "")}](${payload.data.url})`);
    } catch {
      setError("上传失败，请稍后再试");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const body = {
        title,
        slug,
        summary,
        content,
        coverImage: coverImage.trim() || null,
        status,
        categoryId: categoryId || null,
        tags: selectedTags,
      };

      const response = await fetch(
        mode === "create" ? "/api/posts" : `/api/posts/${encodeURIComponent(initialSlug)}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "保存失败，请检查填写内容");
        return;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("网络异常，请稍后再试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/posts" className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]">
            ← 返回文章列表
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{mode === "create" ? "新建文章" : "编辑文章"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={`${inputClass} w-32`}>
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
            maxLength={200}
            className={inputClass}
            placeholder="文章标题"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
            slug <span className="text-red-500">*</span>
          </label>
          <input
            id="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            required
            className={`${inputClass} font-mono`}
            placeholder="hello-world"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">访问地址：/posts/{slug || "…"}</p>
        </div>

        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
            分类
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={inputClass}
          >
            <option value="">未分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="summary" className="mb-1.5 block text-sm font-medium">
            摘要
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={2}
            maxLength={500}
            className={`${inputClass} h-auto resize-y py-2`}
            placeholder="一句话概括这篇文章"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cover" className="mb-1.5 block text-sm font-medium">
            封面图 URL
          </label>
          <input
            id="cover"
            value={coverImage}
            onChange={(event) => setCoverImage(event.target.value)}
            className={inputClass}
            placeholder="/uploads/cover.png 或 https://…"
          />
        </div>

        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">标签</span>
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedTags.length === 0 && <span className="text-xs text-[var(--muted)]">还没有选择标签</span>}
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--accent)]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`移除标签 ${tag}`}
                  className="text-[var(--accent)]/70 hover:text-[var(--accent)]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tagOptions
              .filter((option) => !selectedTags.some((tag) => tag.toLowerCase() === option.name.toLowerCase()))
              .map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => addTag(option.name)}
                  className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  + {option.name}
                </button>
              ))}
          </div>

          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addTag(tagInput);
              }
            }}
            className={`${inputClass} mt-2`}
            placeholder="输入新标签后回车"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">正文（Markdown）</span>
            <span className="text-xs text-[var(--muted)]">{wordCount} 字</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
            >
              {uploading ? "上传中…" : "上传图片"}
            </button>
            <button
              type="button"
              onClick={() => setShowPreview((value) => !value)}
              className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)] lg:hidden"
            >
              {showPreview ? "只看编辑" : "显示预览"}
            </button>
          </div>
        </div>

        <div className={`grid gap-4 ${showPreview ? "lg:grid-cols-2" : ""}`}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={24}
            className="min-h-[420px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-relaxed outline-none transition focus:border-[var(--accent)]"
            placeholder={"# 标题\n\n开始写点什么…"}
          />

          {showPreview && (
            <div className="min-h-[420px] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
              {content.trim() ? (
                <MarkdownArticle content={content} />
              ) : (
                <p className="text-sm text-[var(--muted)]">预览会显示在这里。</p>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
