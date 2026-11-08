# 山间笔记 · 个人博客展示与管理平台

一个自带内容管理后台的个人博客，前台负责展示，后台负责写作与管理。单仓单应用，基于 Next.js 15 App Router 构建，支持 Markdown 写作、代码高亮、目录、评论审核、分类标签、图片上传、RSS 与站点地图。

## 功能特性

### 前台

- 首页文章列表，每页 10 篇，显示标题、摘要、分类、标签、发布日期与阅读量
- 文章详情页：Markdown 渲染、代码高亮、自动生成目录（TOC）、阅读量递增
- 评论区：展示已审核评论与两级回复（回复统一挂在顶级评论下，显示 @昵称），访客回复同样需要审核，博主回复自动通过并带 AUTHOR 徽章
- 分类、标签、按年月归档、关键字搜索（标题 / 摘要 / 正文）
- 文章发布时间管理：支持补录过去时间与未来定时发布，到点前所有前台入口不可见
- 关于页读取站点设置中的作者信息
- 响应式布局、亮 / 暗色主题切换（跟随系统，可手动切换并记忆）
- 每页独立 SEO 元数据、`/sitemap.xml`、`/rss.xml`、自定义 404 页面
- 草稿文章在前台完全不可见，直接访问链接返回 404

### 后台（`/admin`）

- 账号密码登录，JWT 存于 httpOnly Cookie，中间件保护后台页面与写操作接口
- 仪表盘：文章总数 / 已发布 / 草稿、评论总数 / 待审核、总阅读量、最近更新文章
- 文章管理：按状态（草稿 / 已发布 / 定时）筛选、标题 / slug 搜索、按发布时间排序、新建、编辑、删除、发布与撤回
- Markdown 分屏编辑器：实时预览、标题自动生成 slug（可手改）、摘要、封面、分类、标签多选与新建、图片上传（PNG / JPEG / GIF / WebP，按文件头校验）并插入 Markdown
- 分类 / 标签管理：增删改，删除分类后文章自动归为未分类
- 评论管理：待审核 / 已通过筛选，一键通过、撤销通过、删除；可内联以博主身份回复
- 站点设置：站点标题、描述、作者信息、头像与 GitHub 链接；修改管理员密码

## 技术栈

| 层次 | 选型 |
| --- | --- |
| 框架 | Next.js 15（App Router）+ React 19 + TypeScript（strict） |
| 样式 | Tailwind CSS v4 + `@tailwindcss/typography` |
| 数据库 | SQLite + Prisma ORM |
| 鉴权 | bcryptjs 哈希密码 + jose 签发 JWT + httpOnly Cookie + middleware |
| Markdown | react-markdown + remark-gfm + rehype-highlight + rehype-slug |
| 校验 | zod |

## 快速开始

要求 Node.js 18.18+（推荐 20 或 22）。

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（按需修改默认管理员账号与 JWT_SECRET）
cp .env.example .env

# 3. 初始化数据库并写入种子数据
npm run db:setup

# 4. 开发模式
npm run dev
```

打开 <http://localhost:3000> 查看前台，<http://localhost:3000/admin> 进入后台。

默认管理员账号为 `admin` / `admin123`（取自 `.env` 的 `ADMIN_USERNAME` / `ADMIN_PASSWORD`，种子脚本执行时写入）。首次登录后建议在「站点设置」中修改密码。

先生成一个随机 JWT 密钥填入 `.env`（`npm run start` 也运行在 production 模式，示例密钥或不足 32 位的密钥会被拒绝）：

```bash
openssl rand -base64 48
```

### 生产模式

```bash
npm run build
npm run start
```

### 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生成 Prisma Client 并构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run db:setup` | 执行迁移并写入种子数据 |
| `npm run db:migrate` | 创建新的开发迁移 |
| `npm run db:seed` | 仅执行种子脚本 |
| `npm run db:studio` | 打开 Prisma Studio |
| `npm run db:reset` | 重置数据库并重新写入种子数据（会清空数据） |

## 升级（已有数据库）

从旧版本拉取新代码后，按顺序执行：

```bash
npm install
npx prisma migrate deploy   # 开发环境也可以使用 npx prisma migrate dev
npx prisma generate
# 然后重启服务：npm run build && npm run start（或 npm run dev）
```

不要跳过 `npx prisma generate`：旧 Prisma Client 不认识迁移新增的字段，执行 seed 或运行时可能报错。升级前建议备份 `prisma/dev.db`。

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 是 | SQLite 连接串，默认 `file:./dev.db`（相对 `prisma/` 目录） |
| `JWT_SECRET` | 是 | JWT 签名密钥，至少 32 位；生产模式（含 `npm run start`）下缺失、过短或仍为示例值时会明确报错并拒绝签发 / 校验会话 |
| `ADMIN_USERNAME` | 否 | 种子管理员用户名，默认 `admin` |
| `ADMIN_PASSWORD` | 否 | 种子管理员密码，默认 `admin123` |
| `NEXT_PUBLIC_SITE_URL` | 否 | 站点公开地址，用于 canonical、sitemap 与 RSS 中的绝对链接，默认 `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_TIMEZONE` | 否 | 站点时区，用于日期展示、归档分组与定时发布时间输入，默认 `Asia/Shanghai`，不依赖服务器本地时区 |

## 目录结构

```text
.
├── prisma/
│   ├── schema.prisma          # 数据模型
│   ├── migrations/            # 数据库迁移
│   └── seed.ts                # 种子数据（管理员、示例文章、分类标签、站点设置）
├── public/
│   └── uploads/               # 图片上传目录（.gitkeep 占位，内容不提交）
├── src/
│   ├── app/
│   │   ├── (site)/            # 前台：首页、文章、分类、标签、归档、搜索、关于
│   │   ├── admin/             # 后台：登录页与 (panel) 受保护区域
│   │   ├── api/               # Route Handlers：posts、comments、categories、tags、settings、upload、auth
│   │   ├── uploads/[...path]/ # 运行时读取上传文件（保证 next start 后新图立即可见）
│   │   ├── rss.xml/           # RSS 输出
│   │   ├── sitemap.ts         # 站点地图
│   │   ├── layout.tsx         # 根布局、全局 SEO 与主题初始化
│   │   └── globals.css        # 主题变量、代码高亮与文章排版样式
│   ├── components/            # 前台组件与 components/admin 后台组件
│   ├── lib/                   # prisma 单例、auth、jwt、markdown、validators、theme 等
│   └── middleware.ts          # 后台页面与写操作 API 的登录校验
├── .env.example
└── PLAN.md
```

## API 一览

公开读取：

- `GET /api/posts?page=&q=&category=&tag=` 已发布文章列表
- `GET /api/posts/[slug]` 已发布文章详情（含已审核评论）
- `POST /api/comments` 提交评论（默认待审核）

需要登录：

- `POST /api/posts`、`PATCH|DELETE /api/posts/[slug]`
- `GET|POST /api/categories`、`PATCH|DELETE /api/categories/[id]`
- `GET|POST /api/tags`、`PATCH|DELETE /api/tags/[id]`
- `PATCH|DELETE /api/comments/[id]`
- `POST /api/admin/comments/[id]/reply`（博主回复，自动通过并标记 isAdmin）
- `GET|PUT /api/settings`、`PUT /api/settings/password`
- `POST /api/upload`（multipart 字段 `file`，仅 PNG / JPEG / GIF / WebP，按文件头魔数校验，≤ 5MB）

未登录调用受保护接口返回 `401` JSON。

## 部署说明

### 自托管（推荐）

1. 准备一台可持久化磁盘的服务器（Node.js 20+）。
2. 拉取代码后 `npm install`，复制 `.env.example` 为 `.env` 并填写生产配置，务必修改管理员密码。`JWT_SECRET` 使用 `openssl rand -base64 48` 生成，不要保留示例值。
3. 执行 `npm run db:setup` 初始化数据库。
4. `npm run build && npm run start`，可用 systemd / PM2 常驻，前面挂 Nginx 反向代理。
5. 需要持久化两个位置：
   - `prisma/dev.db`（SQLite 数据库）
   - `public/uploads/`（上传的图片）

### Vercel 等 Serverless 平台

项目可以构建部署，但需要注意：

- 平台文件系统只读且不持久，SQLite 与 `public/uploads/` 的写入无法保留。若要长期使用，应将数据库换成托管 PostgreSQL / MySQL（修改 `prisma/schema.prisma` 的 provider 与 `DATABASE_URL`），图片改用对象存储并调整上传接口。
- 在环境变量中设置 `NEXT_PUBLIC_SITE_URL` 为正式域名，否则 sitemap / RSS 中的链接会指向 localhost。

## 安全提示

- 生产环境必须使用 `openssl rand -base64 48` 生成至少 32 位的 `JWT_SECRET`，并修改默认管理员密码；示例值或过短的密钥会让服务在登录 / 鉴权时直接报错拒绝运行。
- 会话 Cookie 使用 httpOnly + SameSite=Lax；生产模式下启用 Secure，请通过 HTTPS 访问。
- 上传接口不信任客户端声明的 MIME 类型，只按文件头魔数识别 PNG / JPEG / GIF / WebP，并限制 5MB；SVG 因可携带脚本已不再支持。
- 仓库不会提交 `.env`、数据库文件、`node_modules`、`.next` 与上传内容。
