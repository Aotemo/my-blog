# 个人博客展示与管理平台 — 实施计划

## 技术选型（单仓单应用，全栈）
- **框架**：Next.js 15（App Router）+ TypeScript（strict）
- **样式**：Tailwind CSS v4，支持亮/暗色主题切换
- **数据库**：SQLite + Prisma ORM（`prisma/dev.db`，不提交到 git）
- **鉴权**：管理员账号密码登录，bcryptjs 哈希 + `jose` 签发 JWT，存于 httpOnly Cookie；`middleware.ts` 保护 `/admin/**` 与写操作 API
- **Markdown**：编辑器用 textarea + 实时预览（分屏）；渲染用 `react-markdown` + `remark-gfm` + `rehype-highlight`（代码高亮）+ `rehype-slug`
- **校验**：`zod` 校验所有 API 入参
- **包管理**：npm

## 数据模型（prisma/schema.prisma）
- `User`：id, username(unique), passwordHash, createdAt
- `Post`：id, title, slug(unique), summary, content(Markdown), coverImage?, status(`DRAFT`|`PUBLISHED`), viewCount, publishedAt?, createdAt, updatedAt, categoryId?, tags(多对多)
- `Category`：id, name(unique), slug(unique)
- `Tag`：id, name(unique), slug(unique)
- `Comment`：id, postId, author, email?, content, approved(bool, 默认 false), createdAt
- `SiteSetting`：单行配置 — siteTitle, siteDescription, authorName, authorBio, avatarUrl?, githubUrl?

## 功能清单

### 一、前台展示
1. `/` 首页：已发布文章列表（标题、摘要、分类、标签、发布日期、阅读量），分页（每页 10）
2. `/posts/[slug]`：文章详情，Markdown 渲染 + 代码高亮 + 目录(TOC)；阅读量 +1；底部展示已审核评论 + 评论表单（提交后进入待审核）
3. `/categories/[slug]`、`/tags/[slug]`：按分类/标签筛选的文章列表
4. `/archive`：按年月归档
5. `/search?q=`：标题/摘要/正文关键字搜索
6. `/about`：读取 SiteSetting 的作者信息
7. 全局：响应式布局、导航栏、页脚、暗色模式切换、404 页面、每页 `generateMetadata` SEO、`/sitemap.xml`、`/rss.xml`
8. 草稿文章前台不可见（访问返回 404）

### 二、后台管理（`/admin`，需登录）
1. `/admin/login`：登录页；登出按钮
2. `/admin` 仪表盘：文章总数/已发布/草稿数、评论总数/待审核数、总阅读量、最近 5 篇文章
3. `/admin/posts`：文章列表（按状态筛选、标题搜索、分页），新建/编辑/删除/发布/撤回草稿
4. `/admin/posts/new`、`/admin/posts/[id]/edit`：Markdown 分屏编辑器，字段：标题、slug（可由标题自动生成，可手改，唯一校验）、摘要、封面图 URL、分类（下拉）、标签（多选，可新建）、状态
5. `/admin/categories`、`/admin/tags`：增删改（删除分类时文章 categoryId 置空）
6. `/admin/comments`：评论列表，审核通过/删除
7. `/admin/settings`：编辑 SiteSetting；修改管理员密码
8. 图片上传：`POST /api/upload` 保存到 `public/uploads/`（仅图片类型，≤5MB），编辑器内可上传并插入 Markdown 图片语法

### 三、API（`/app/api/**`，route handlers）
- 公开：`GET /api/posts`、`GET /api/posts/[slug]`、`POST /api/comments`
- 需鉴权：posts/categories/tags/comments/settings 的增删改、upload
- 未登录调用受保护接口返回 401 JSON

## 工程要求
- `npm run dev` / `npm run build` / `npm run start` / `npm run lint` 均可用，**build 与 lint 零错误**
- `npm run db:setup`：执行 `prisma migrate dev` + 种子数据（`prisma/seed.ts`）
- 种子：管理员账号来自 `.env` 的 `ADMIN_USERNAME` / `ADMIN_PASSWORD`（默认 admin / admin123），3 篇示例文章（含代码块），2 个分类，3 个标签，SiteSetting 默认值
- `.env.example` 列出 `DATABASE_URL`、`JWT_SECRET`、`ADMIN_USERNAME`、`ADMIN_PASSWORD`；`.env`、`*.db`、`node_modules`、`.next`、`public/uploads/*`（保留 .gitkeep）写入 `.gitignore`
- `README.md`（中文）：功能介绍、技术栈、本地启动步骤、目录结构、部署说明
- 代码结构：`src/app`、`src/components`、`src/lib`（prisma 单例、auth、markdown、validators）

## 实施阶段（每阶段结束 git commit 一次，不要 push）
1. **脚手架**：Next.js + Tailwind + Prisma + schema + 迁移 + seed + .gitignore/.env.example
2. **前台**：全部前台页面与公开 API
3. **鉴权与后台**：登录、middleware、后台全部页面与受保护 API、上传
4. **收尾**：SEO/sitemap/RSS、暗色模式、README、`npm run lint` 与 `npm run build` 全部通过

## 验收标准（由规划方逐项检查）
- [ ] 全新克隆后按 README 步骤 `npm install && cp .env.example .env && npm run db:setup && npm run build` 成功
- [ ] `npm run lint` 零错误
- [ ] 首页显示种子文章；文章详情页 Markdown/代码高亮/TOC 正常；阅读量递增
- [ ] 草稿 slug 访问前台返回 404
- [ ] 分类、标签、归档、搜索页结果正确
- [ ] 未登录访问 `/admin` 重定向到 `/admin/login`；未登录 `POST /api/posts` 返回 401
- [ ] 登录后可完整执行文章 CRUD、发布/撤回，前台即时反映
- [ ] 前台提交评论 → 后台审核通过 → 前台可见
- [ ] 分类/标签管理、站点设置、改密码可用
- [ ] 图片上传成功并可在文章中显示；非图片被拒绝
- [ ] `/sitemap.xml`、`/rss.xml` 输出合法 XML
- [ ] 暗色模式切换正常，移动端布局无明显错乱
- [ ] git 中无 `.env`、数据库文件、`node_modules`
