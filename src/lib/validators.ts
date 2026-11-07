import { z } from "zod";

export const slugField = z
  .string()
  .trim()
  .min(1, "slug 不能为空")
  .max(120, "slug 过长")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能包含小写字母、数字和连字符");

export const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export const postSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200, "标题过长"),
  slug: slugField,
  summary: z.string().trim().max(500, "摘要过长").default(""),
  content: z.string().default(""),
  coverImage: z.string().trim().max(500).nullish(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  categoryId: z.string().trim().min(1).nullish(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export const postUpdateSchema = postSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "名称不能为空").max(50, "名称过长"),
  slug: slugField.optional(),
});

export const tagSchema = z.object({
  name: z.string().trim().min(1, "名称不能为空").max(50, "名称过长"),
  slug: slugField.optional(),
});

export const commentSchema = z.object({
  postSlug: z.string().trim().min(1, "缺少文章标识"),
  author: z.string().trim().min(1, "请填写昵称").max(50, "昵称过长"),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "邮箱格式不正确"),
  content: z.string().trim().min(1, "评论内容不能为空").max(2000, "评论内容过长"),
});

export const commentModerationSchema = z.object({
  approved: z.boolean(),
});

export const settingsSchema = z.object({
  siteTitle: z.string().trim().min(1, "站点标题不能为空").max(100),
  siteDescription: z.string().trim().max(300).default(""),
  authorName: z.string().trim().min(1, "作者名称不能为空").max(50),
  authorBio: z.string().trim().max(1000).default(""),
  avatarUrl: z.string().trim().max(500).nullish(),
  githubUrl: z.string().trim().max(500).nullish(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(6, "新密码至少 6 位").max(72, "新密码过长"),
});

export type PostInput = z.infer<typeof postSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
