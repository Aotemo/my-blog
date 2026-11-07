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

---

## 阶段 5：前台视觉风格 —「极简排版 + 复古像素」（用户选定 1+10）

### 设计原则
**骨架是极简，点缀是像素。** 布局、留白、正文阅读体验完全按极简博客来做；像素元素只出现在品牌、导航、标签、按钮、边框、图标、装饰等"界面层"，**绝不用于长篇正文**，保证中文阅读舒适。

### 布局（极简）
- 单栏居中，内容区 `max-width: 680px`（文章页正文同宽，TOC 在宽屏时悬浮于右侧空白区，窄屏折叠为文首可展开块）
- 首页：顶部像素风自我介绍块（像素头像 + `> HELLO, I'M {authorName}_` 闪烁光标 + 一句简介），下方为**列表式**文章（日期 / 标题 / 摘要 / 标签），条目间用像素虚线分隔；不用封面大图卡片
- 侧栏去掉，分类/标签入口放到导航和页脚
- 大量留白，行高 1.8，正文字号 17px

### 像素元素（复古 8-bit）
- **字体**：
  - 像素字体 `Press Start 2P`（通过 `next/font/google` 加载）：仅用于 Logo、导航、日期、标签、按钮、小标题前缀标签、页脚、404 大字等**英文/数字短文本**，字号克制（10–14px）
  - 中文与正文：系统无衬线栈（`-apple-system, "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`）；文章标题用粗体无衬线
  - 代码：`JetBrains Mono`（next/font/google）
- **边框与阴影**：按钮、标签、输入框、代码块、引用块使用"像素阶梯边框"（多层 `box-shadow` 模拟 2px 硬像素边，无圆角、无模糊阴影）；hover 时 `translate(-2px,-2px)` + 硬阴影加深，active 时下压
- **配色**（CSS 变量统一管理，Tailwind v4 `@theme` 中定义）：
  - 亮色"Game Boy 纸面"：背景 `#f4f1e8`，正文 `#1f1f1f`，主强调色 `#2b6cb0`（像素蓝），次强调 `#e85d4a`（像素红，用于 hover/光标/标记），标签底 `#e2dccb`
  - 暗色"夜间关卡"：背景 `#14141f`，正文 `#e6e6e6`，主强调 `#7cd4fd`，次强调 `#ff7a90`，代码块底 `#1d1d2b`
  - 对比度满足 WCAG AA
- **图标**：用纯 CSS/内联 SVG（`shape-rendering="crispEdges"`）绘制少量像素图标：太阳/月亮（主题切换）、RSS、GitHub、放大镜、心形/眼睛（阅读量）。不引入大型图标库
- **装饰细节**：
  - Logo 旁一个 8×8 像素小精灵（内联 SVG）
  - 标题前缀：文章内 `h2` 前显示像素 `▶`，`h3` 前显示 `■`
  - 链接 hover 为像素块状背景高亮（非下划线渐变）
  - 阅读进度条：文章页顶部 4px 像素分段进度条（类血条/经验条）
  - 404 页：`GAME OVER` 像素大字 + `> PRESS START TO GO HOME` 按钮
  - 空状态（搜索无结果）：`NO ITEMS FOUND` 像素提示
  - 页脚：`© 2026 {authorName} · INSERT COIN TO CONTINUE` 风格小字
- **动效克制**：仅光标闪烁、按钮按压、进度条；尊重 `prefers-reduced-motion`（关闭闪烁与过渡）
- 图片：文章内图片保持原样平滑渲染（不做像素化）；仅头像/装饰图可用 `image-rendering: pixelated`

### 后台
- 后台保持清爽中性的管理界面，只统一使用同一套配色变量与像素按钮样式，保证风格一致，**不追求复古装饰**，以效率为先

### 验收标准（阶段 5）
- [ ] 正文与中文标题不使用像素字体；像素字体只出现在上述界面层
- [ ] 亮/暗两套配色完整覆盖所有前台页面（含 404、搜索空状态、评论表单、代码块）
- [ ] 无圆角、无模糊阴影（前台）；按钮/标签/输入框具有像素阶梯边框与按压反馈
- [ ] 375px 宽移动端无横向滚动、导航可用
- [ ] `prefers-reduced-motion` 下无闪烁动画
- [ ] `npm run lint`、`npm run build` 零错误；字体通过 next/font 自托管，无外部运行时字体请求
