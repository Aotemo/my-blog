"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { MarkdownArticle } from "@/components/markdown-article";
import { isImageFile, uploadImage } from "@/lib/client-upload";
import { SITE_TIMEZONE } from "@/lib/config";
import { formatDateTimeLocal, parseDateTimeLocal } from "@/lib/format";
import { slugify } from "@/lib/slug";

export type EditorPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  status: string;
  publishedAt: string | null;
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
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt ? formatDateTimeLocal(post.publishedAt) : "",
  );
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags ?? []);
  const [tagOptions, setTagOptions] = useState<Option[]>(tags);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [coverUploading, setCoverUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const activePlaceholdersRef = useRef<Set<string>>(new Set());

  const wordCount = useMemo(() => content.replace(/\s/g, "").length, [content]);
  const parsedPublishedAt = publishedAt ? parseDateTimeLocal(publishedAt) : null;
  const isScheduled =
    status === "PUBLISHED" && parsedPublishedAt !== null && parsedPublishedAt.getTime() > Date.now();

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

  function insertAtCursor(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}${prev && !prev.endsWith("\n") ? "\n" : ""}${snippet}`);
      return;
    }

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let inserted = false;
    try {
      inserted = document.execCommand("insertText", false, snippet);
    } catch {
      inserted = false;
    }
    if (!inserted) {
      textarea.setRangeText(snippet, start, end, "end");
    }
    setContent(textarea.value);
  }

  function replacePlaceholder(placeholder: string, replacement: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev.replace(placeholder, replacement));
      return;
    }

    const index = textarea.value.indexOf(placeholder);
    if (index === -1) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    if (document.activeElement === textarea) {
      textarea.setSelectionRange(index, index + placeholder.length);
      let inserted = false;
      try {
        inserted = document.execCommand("insertText", false, replacement);
      } catch {
        inserted = false;
      }
      if (inserted) {
        const delta = replacement.length - placeholder.length;
        const nextStart =
          selectionStart > index + placeholder.length
            ? selectionStart + delta
            : index + replacement.length;
        const nextEnd =
          selectionEnd > index + placeholder.length
            ? selectionEnd + delta
            : index + replacement.length;
        textarea.setSelectionRange(Math.max(0, nextStart), Math.max(0, nextEnd));
        setContent(textarea.value);
        return;
      }
    }

    // 非聚焦时用 setRangeText，避免把焦点抢回正文
    textarea.setRangeText(replacement, index, index + placeholder.length, "preserve");
    setContent(textarea.value);
  }

  function handleContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    let next = textarea.value;
    const matches = next.match(/!\[上传中 [^\]\n]*…\]\(\)/g) ?? [];
    const stale = matches.filter(
      (placeholder) => !activePlaceholdersRef.current.has(placeholder),
    );

    if (stale.length === 0) {
      setContent(next);
      return;
    }

    const selection = textarea.selectionStart;
    let removedBeforeCaret = 0;
    for (const placeholder of stale) {
      let index = next.indexOf(placeholder);
      while (index !== -1) {
        if (index < selection) removedBeforeCaret += placeholder.length;
        next = `${next.slice(0, index)}${next.slice(index + placeholder.length)}`;
        index = next.indexOf(placeholder, index);
      }
    }

    textarea.value = next;
    const caret = Math.max(0, selection - removedBeforeCaret);
    textarea.setSelectionRange(caret, caret);
    setContent(next);
  }

  function createPlaceholder() {
    return `![上传中 ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}…]()`;
  }

  async function handleImageFiles(files: File[]) {
    const images = files.filter(isImageFile);
    const ignored = files.length - images.length;

    if (images.length === 0) {
      setError("仅支持图片文件");
      return;
    }

    setError(ignored > 0 ? `已忽略 ${ignored} 个非图片文件` : "");

    const placeholders = images.map(() => createPlaceholder());
    for (const placeholder of placeholders) {
      activePlaceholdersRef.current.add(placeholder);
    }
    insertAtCursor(placeholders.join("\n"));
    setUploadingCount((count) => count + images.length);

    const failures: string[] = [];
    await Promise.all(
      images.map(async (file, index) => {
        const placeholder = placeholders[index];
        try {
          const result = await uploadImage(file);
          activePlaceholdersRef.current.delete(placeholder);
          replacePlaceholder(placeholder, `![${result.alt}](${result.url})`);
        } catch (uploadError) {
          activePlaceholdersRef.current.delete(placeholder);
          replacePlaceholder(placeholder, "");
          failures.push(uploadError instanceof Error ? uploadError.message : "图片上传失败");
        } finally {
          setUploadingCount((count) => Math.max(0, count - 1));
        }
      }),
    );

    if (failures.length > 0) {
      setError(
        failures.length === images.length
          ? failures[0]
          : `部分图片上传失败：${failures[0]}`,
      );
    }
  }

  function getClipboardImages(data: DataTransfer): File[] {
    return Array.from(data.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = getClipboardImages(event.clipboardData);
    if (files.length === 0) return;
    event.preventDefault();
    void handleImageFiles(files);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragActive(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragActive(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) void handleImageFiles(files);
  }

  async function handleCoverFile(file: File) {
    if (!isImageFile(file)) {
      setError("封面仅支持图片文件");
      return;
    }

    setCoverUploading(true);
    setError("");
    try {
      const result = await uploadImage(file);
      setCoverImage(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "封面上传失败");
    } finally {
      setCoverUploading(false);
    }
  }

  function handleCoverPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const files = getClipboardImages(event.clipboardData);
    if (files.length === 0) return;
    event.preventDefault();
    void handleCoverFile(files[0]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      let publishedAtIso: string | null = null;
      if (publishedAt.trim()) {
        const parsedDate = parseDateTimeLocal(publishedAt);
        if (!parsedDate) {
          setError("发布时间格式不正确，请重新选择");
          return;
        }
        publishedAtIso = parsedDate.toISOString();
      }

      const body = {
        title,
        slug,
        summary,
        content,
        coverImage: coverImage.trim() || null,
        status,
        publishedAt: publishedAtIso,
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
          <label htmlFor="publishedAt" className="mb-1.5 block text-sm font-medium">
            发布时间（{SITE_TIMEZONE}）
          </label>
          <input
            id="publishedAt"
            type="datetime-local"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            className={`${inputClass} max-w-xs`}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            已发布且留空时自动取当前时间；未来时间为定时发布。
          </p>
          {isScheduled && parsedPublishedAt && (
            <p className="mt-1 text-xs text-[var(--accent-2)]">
              定时发布：{formatDateTimeLocal(parsedPublishedAt).replace("T", " ")} 后前台可见
            </p>
          )}
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
            封面图
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="cover"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              onPaste={handleCoverPaste}
              className={`${inputClass} min-w-0 flex-1`}
              placeholder="/uploads/cover.png 或 https://…"
            />
            <input
              id="cover-file"
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void handleCoverFile(file);
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="h-10 shrink-0 rounded-lg border border-[var(--border)] px-3 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
            >
              {coverUploading ? "上传中…" : "上传封面"}
            </button>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">可粘贴图片，或点击「上传封面」自动填入 URL。</p>
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt="封面预览"
              className="mt-2 h-20 max-w-full border-2 border-[var(--border)] object-cover"
            />
          )}
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
              id="body-image-file"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (files.length > 0) void handleImageFiles(files);
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCount > 0}
              className="h-8 rounded-lg border border-[var(--border)] px-3 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
            >
              {uploadingCount > 0 ? `上传中 ${uploadingCount}…` : "上传图片"}
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
          <div
            className="relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onPaste={handlePaste}
              rows={24}
              aria-label="正文 Markdown"
              className={`min-h-[420px] w-full resize-y rounded-xl border bg-[var(--background)] p-4 font-mono text-sm leading-relaxed outline-none transition ${
                dragActive
                  ? "border-2 border-dashed border-[var(--accent-2)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] focus:border-[var(--accent)]"
              }`}
              placeholder={"# 标题\n\n开始写点什么…"}
            />
            {dragActive && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-[var(--accent-2)] bg-[var(--accent-soft)]">
                <span className="border-2 border-[var(--ink)] bg-[var(--surface)] px-3 py-2 font-pixel text-[9px] leading-none text-[var(--accent)]">
                  松开以上传图片
                </span>
              </div>
            )}
          </div>

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

        <p className="mt-2 text-xs text-[var(--muted)]">支持粘贴或拖拽图片上传</p>
      </div>
    </form>
  );
}
