export const POST_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

export const POST_STATUSES: PostStatus[] = [POST_STATUS.DRAFT, POST_STATUS.PUBLISHED];

export const PAGE_SIZE = 10;
export const ADMIN_PAGE_SIZE = 10;

export const COOKIE_NAME = "blog_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
// 仅接受通过文件头魔数校验的位图格式；SVG 等可执行脚本的格式不再支持
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
