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

---

## 阶段 6：评论回复 + 文章发布时间管理

### 6.1 评论回复

**数据模型**（新增迁移，不得破坏现有数据）
- `Comment` 新增：
  - `parentId String?` → 自关联 `parent Comment? @relation("CommentReplies", ..., onDelete: Cascade)`，`replies Comment[]`
  - `replyToName String?`：被回复人的昵称（用于展示 `@某某`）
  - `isAdmin Boolean @default(false)`：博主回复标记
- 索引：`@@index([parentId])`

**结构规则（两级展示）**
- 顶级评论 `parentId = null`。
- 回复任何评论（无论顶级还是回复）时，`parentId` 一律指向**所属顶级评论**，`replyToName` 记录直接被回复者昵称 → 前台只有两层：顶级评论 + 其下平铺的回复列表（按时间正序），回复中显示 `@replyToName`。
- 只能回复**已审核通过**且属于同一篇文章的评论；否则 400。
- 删除顶级评论时级联删除其全部回复；删除单条回复不影响其他。

**前台**
- 每条已审核评论/回复有「REPLY」像素小按钮，点击后在该评论下方内联展开回复表单（同一时刻只展开一个），表单显示「回复 @xxx」并可取消。
- 访客回复与普通评论一样进入待审核，提交后提示「已提交，审核后显示」。
- 博主回复带像素风 `AUTHOR` / 「博主」徽章，样式区分。
- 评论数统计（标题处 `COMMENTS 0N`）计入已审核的回复。
- 未审核的回复前台不可见；若顶级评论未审核，其回复也不可见。

**API**
- `POST /api/comments`：入参增加可选 `parentId`；服务端校验并计算顶级 `parentId` 与 `replyToName`。
- 新增 `POST /api/admin/comments/[id]/reply`（需鉴权）：博主回复，`author` 取 SiteSetting.authorName，`isAdmin = true`，**自动 approved = true**。

**后台 `/admin/comments`**
- 列表显示：所属文章、是否为回复（显示「回复 @xxx」与父评论摘要）、博主标记、审核状态。
- 每条评论有「回复」操作：内联文本框，提交即发布博主回复。
- 审核通过一条回复时，若其顶级评论尚未审核，给出提示（仍允许操作）。
- 仪表盘待审核数包含回复。

### 6.2 文章发布时间管理

**数据模型**
- `Post` 新增 `contentUpdatedAt DateTime?`：仅在标题/摘要/正文/封面/分类/标签变化时更新（**不能用 `updatedAt`，因为阅读量 +1 也会刷新它**）。迁移时用现有 `updatedAt` 回填。

**规则**
- 编辑器新增「发布时间」字段（`datetime-local`，以站点时区显示与输入）：
  - 状态为「已发布」且发布时间为空 → 保存时设为当前时间。
  - 可手动设为**过去时间**（补录/迁移旧文章）。
  - 可设为**未来时间** → 即「定时发布」：状态仍为 `PUBLISHED`，但到时间前前台不可见。无需 cron，所有前台查询统一加 `publishedAt <= now()`。
  - 撤回为草稿时**保留**原 publishedAt，再次发布时沿用（编辑器可手动修改/清空）。
- **所有前台出口**必须统一使用同一个"可见文章"查询条件（抽到 `src/lib` 一处）：首页、文章详情、分类/标签/归档/搜索、上下篇、`GET /api/posts*`、sitemap、RSS、评论提交校验（不能对未公开文章评论）、关于页统计等。
- 时区：新增 `src/lib/config.ts` 中 `SITE_TIMEZONE`（读取 `NEXT_PUBLIC_SITE_TIMEZONE`，默认 `Asia/Shanghai`），所有日期展示与 `datetime-local` 输入转换都显式使用该时区，**不依赖服务器本地时区**。`.env.example` 与 README 同步。

**展示**
- 文章页：显示发布日期；若 `contentUpdatedAt` 比 `publishedAt` 晚 1 天以上，额外显示 `UPDATED yyyy-mm-dd`。
- 后台文章列表：状态列区分 `草稿` / `已发布` / `定时 (yyyy-mm-dd HH:mm)`；可按「定时」筛选；列表显示发布时间并支持按发布时间排序。
- 仪表盘：增加「定时待发布」数量及最近一篇定时文章的发布时间。
- 文章页 `generateMetadata` 带 `article:published_time` / `article:modified_time`；RSS `pubDate` 用 publishedAt。

**种子数据**
- 增加 1 篇定时发布（未来 7 天）的示例文章、1 条顶级评论下的访客回复（已审核）和 1 条博主回复，便于演示。

### 验收标准（阶段 6）
- [ ] 现有数据库可通过 `prisma migrate dev` 平滑升级，已有评论/文章不丢失；全新 `db:setup` 也成功
- [ ] 访客可回复已审核评论，回复需审核；回复"回复"仍挂在顶级评论下并显示 `@昵称`
- [ ] 对未审核评论、其他文章评论、不存在评论的回复返回 400/404
- [ ] 后台博主回复立即可见并带博主徽章；删除顶级评论级联删除回复
- [ ] 未来发布时间的文章在首页/详情/分类/标签/归档/搜索/API/sitemap/RSS 中均不可见，后台显示「定时」
- [ ] 把定时文章发布时间改到过去后立即可见；手动设置过去时间后按该时间排序与归档
- [ ] 阅读量增加不改变「UPDATED」日期；编辑正文后才更新
- [ ] 日期展示与服务器时区无关（用 `TZ=UTC npm run start` 与 `TZ=America/New_York npm run start` 分别验证同一篇文章显示相同日期）
- [ ] `npm run lint`、`npm run build` 零错误；前台新增 UI 遵循阶段 5 像素风格规范

---

## 阶段 7：编辑器粘贴 / 拖拽图片上传

现状：编辑器只能通过「上传图片」按钮选文件上传。目标：截图或复制图片后在正文里 **Ctrl/Cmd+V 直接粘贴**，或把图片**拖进编辑区**，自动上传并插入 Markdown。

### 行为
- **粘贴**：在正文 textarea 粘贴时，若 `clipboardData` 中含图片文件（`kind === "file"` 且 `type` 以 `image/` 开头）→ 阻止默认行为，逐张上传；**不含图片时完全保持默认文本粘贴**（含从网页复制的富文本/纯文字，不要拦截）。
- **拖拽**：把一张或多张图片文件拖到正文区域时同样上传插入；拖拽悬停时编辑区显示像素虚线高亮 + 「松开以上传图片」提示；非图片文件忽略并提示。
- **占位符**：在光标处立即插入占位 `![上传中 <id>…]()`，上传成功后替换为 `![<alt>](<url>)`；失败则移除占位并显示错误提示。多张图片按顺序各占一行插入。上传期间用户可继续编辑，替换时按占位符文本定位（不能依赖上传开始时的光标位置）。
- **alt 文本**：有原文件名则取不含扩展名的文件名；剪贴板截图（通常名为 `image.png`）用 `image`。
- **大图处理**：文件 > 5MB 时在浏览器端用 canvas 压缩：长边不超过 2560px，转为 WebP（不支持则 JPEG）质量 0.85；GIF 不压缩（避免丢动画），超限直接提示。压缩后仍 > 5MB 则提示失败。
- **撤销**：插入/替换尽量使用 `setRangeText` 或 `document.execCommand("insertText")`，让 Ctrl+Z 可用；保持 React 受控状态同步。
- **封面图字段**：支持在封面输入框上粘贴图片，以及旁边加「上传」按钮，上传后自动填入 URL 并显示小缩略图预览。
- 复用现有 `/api/upload`（服务端校验逻辑不变）。把上传与压缩逻辑抽到 `src/lib/client-upload.ts`，按钮上传、粘贴、拖拽共用。
- 编辑区下方给出提示文字：「支持粘贴或拖拽图片上传」。

### 验收标准（阶段 7）
- [ ] 粘贴 1 张截图 → 插入 `![image](/uploads/xxx.png)`，预览区立即显示图片
- [ ] 一次粘贴/拖拽多张 → 按顺序全部插入
- [ ] 粘贴纯文本、从网页复制的文字时行为与之前完全一致
- [ ] 上传过程中继续打字，最终图片链接插入到正确位置，无残留占位符
- [ ] 上传失败（如非图片、超限、未登录）时占位符被移除并有错误提示
- [ ] > 5MB 的 PNG 被压缩后上传成功；GIF 超限给出明确提示
- [ ] 封面图可粘贴/上传并显示缩略图
- [ ] Ctrl+Z 能撤销插入
- [ ] `npm run lint`、`npm run build` 零错误
