import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "技术笔记", slug: "tech" },
  { name: "生活随笔", slug: "life" },
];

const tags = [
  { name: "Next.js", slug: "nextjs" },
  { name: "TypeScript", slug: "typescript" },
  { name: "思考", slug: "thinking" },
];

const posts = [
  {
    title: "用 Next.js 15 搭建一个干净的个人博客",
    slug: "build-a-blog-with-nextjs-15",
    summary: "从零开始，用 App Router、Server Components 和 Prisma 搭一个自己用得顺手的博客，而不只是套一个主题。",
    category: "tech",
    tags: ["nextjs", "typescript"],
    daysAgo: 2,
    coverImage: null,
    content: `# 为什么自己写一个博客

现成的博客主题很多，但真正用起来顺手的很少。自己写的好处是：**每一处交互都可以按自己的习惯来**。

这篇文章记录我搭建这个博客时的几个关键选择。

## 一、选择 App Router

Next.js 15 默认使用 App Router。对于博客这种以内容为主的站点，服务端组件几乎是天然契合的：

- 列表页与详情页全部在服务端取数，首屏不依赖客户端 JS
- 只有交互部分（暗色切换、评论表单）才标记 \`"use client"\`
- \`generateMetadata\` 让每篇文章自带 SEO 信息

## 二、数据层用 Prisma + SQLite

SQLite 足够支撑一个个人博客，而且部署时不用额外维护数据库服务：

\`\`\`prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String
  status    String   @default("DRAFT")
  createdAt DateTime @default(now())
}
\`\`\`

一个容易踩的坑是开发环境热更新会反复创建 PrismaClient，所以要写一个单例：

\`\`\`ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
\`\`\`

## 三、草稿必须真的不可见

很多博客的"草稿"只是列表里不显示，直接访问链接仍然能看到。正确的做法是在查询层就加上状态过滤：

\`\`\`ts
const post = await prisma.post.findFirst({
  where: { slug, status: "PUBLISHED" },
});
if (!post) notFound();
\`\`\`

## 小结

技术选型没有绝对的对错，重要的是**自己能维护**。这套组合的总体积很小，冷启动快，改起来也不用翻文档。

下一步我打算加上全文搜索和 RSS，让阅读体验再完整一点。`,
  },
  {
    title: "关于「把东西写下来」这件事",
    slug: "why-i-write-things-down",
    summary: "写作不是为了展示，而是为了把模糊的想法逼到清晰。这篇短文聊聊我坚持记录的原因。",
    category: "life",
    tags: ["thinking"],
    daysAgo: 9,
    coverImage: null,
    content: `# 关于「把东西写下来」这件事

我一直觉得，**没有被写下来的想法，其实并不存在**。

## 想法是液态的

在脑子里的时候，一个想法总是显得很有道理。可一旦要落成句子，你就会发现：

1. 有些词你其实不知道确切含义
2. 有些逻辑中间断了一环
3. 有些结论只是情绪的延伸

写作是把这个液态的东西倒进模具，让它凝固。凝固之后你才能看清它的形状，哪怕形状很难看。

## 记录的成本很低

> 你不需要为每一条笔记负责，你只需要让它存在。

我现在的习惯是：任何让我停顿三秒以上的念头，先记一句话。不做分类、不写标签、不考虑以后有没有用。

一年之后回看，真正有价值的往往不是那些"精心整理"的内容，而是当时随手记下、后来完全想不起来为什么记的那几句。

## 一个很小的练习

如果你也想开始，可以试试这个：

- 每天写三句话
- 不评价好坏
- 不要求连贯

坚持两周，你会发现自己开始**主动观察**了。因为你知道晚上要写点什么，白天就会多看一眼。

写作的回报不在文章发布的那一刻，而在你开始留意生活的那一刻。`,
  },
  {
    title: "TypeScript 里几个容易被忽略的实用类型",
    slug: "handy-typescript-types",
    summary: "整理几个日常写业务代码时真正用得上、但常常被忽略的 TypeScript 类型工具与写法。",
    category: "tech",
    tags: ["typescript", "nextjs"],
    daysAgo: 20,
    coverImage: null,
    content: `# TypeScript 里几个实用类型

写业务代码时，类型不只是"不报错"，它还能帮你**把不可能的状态排除掉**。

## 一、satisfies：既要校验，也要推断

\`as const\` 会丢失校验，类型注解会丢失字面量推断。\`satisfies\` 两者兼得：

\`\`\`ts
const routes = {
  home: "/",
  posts: "/posts",
} satisfies Record<string, \`/\${string}\`>;

// routes.home 的类型仍然是 "/"
\`\`\`

## 二、用 never 做穷尽检查

枚举分支忘记处理时，编译器应该报错，而不是静默通过：

\`\`\`ts
type Status = "DRAFT" | "PUBLISHED";

function label(status: Status): string {
  switch (status) {
    case "DRAFT":
      return "草稿";
    case "PUBLISHED":
      return "已发布";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}
\`\`\`

以后新增状态，\`default\` 分支会立刻报错，提醒你补上处理逻辑。

## 三、Prisma 的 GetPayload

不用手写"文章 + 分类 + 标签"的联合类型：

\`\`\`ts
const include = { category: true, tags: true } satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof include }>;
\`\`\`

数据库结构调整后，类型自动跟着变。

## 四、Awaited 与 ReturnType 组合

推断异步函数的返回类型，避免重复声明：

\`\`\`ts
async function loadSettings() {
  return { siteTitle: "blog", authorName: "me" };
}

type Settings = Awaited<ReturnType<typeof loadSettings>>;
\`\`\`

## 写在最后

类型系统的价值在于**把约定写进代码**。当你发现自己反复在注释里解释"这个字段一定有值"时，通常意味着类型可以再收紧一点。`,
  },
  {
    title: "下个版本要做什么：写在发布之前",
    slug: "whats-next-scheduled-post",
    summary: "这是一篇定时发布的示例文章，用来演示未来发布时间在后台与前台的差异。到时间之前，前台任何入口都看不到它。",
    category: "tech",
    tags: ["nextjs", "thinking"],
    daysAgo: -7,
    coverImage: null,
    content: `# 下个版本要做什么

这是一篇**定时发布**的示例文章：数据库里状态已经是「已发布」，但发布时间在 7 天之后。

## 为什么需要定时发布

有些内容适合在特定时间点上线，比如版本公告、活动说明或周报。没有定时能力时，只能人工守着时间点点击发布。

现在只需要在编辑器里把「发布时间」设为一个未来时间：

- 状态保持「已发布」
- 后台列表显示「定时」
- 前台所有入口（首页、分类、标签、归档、搜索、API、RSS、sitemap）都会等到时间到达后才展示

## 查询条件只写一次

所有前台查询共用同一个条件，避免漏掉某个出口：

\`\`\`ts
export function publishedPostWhere(now = new Date()) {
  return {
    status: "PUBLISHED",
    publishedAt: { lte: now },
  };
}
\`\`\`

## 到点之后

无需 cron 或后台任务，下一次请求自然就会看到它。把发布时间改到过去，也会立即出现在前台。`,
  },
];

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  console.log(`✓ 管理员账号：${username}`);

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  console.log(`✓ 分类 ${categories.length} 个`);

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
  }
  console.log(`✓ 标签 ${tags.length} 个`);

  for (const item of posts) {
    const category = await prisma.category.findUnique({ where: { slug: item.category } });
    const tagRecords = await prisma.tag.findMany({
      where: { slug: { in: item.tags } },
      select: { id: true },
    });

    const publishedAt = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000);

    const baseData = {
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      content: item.content,
      coverImage: item.coverImage,
      status: "PUBLISHED",
      publishedAt,
      categoryId: category?.id ?? null,
      viewCount: Math.floor(Math.random() * 300) + 20,
    };

    const tagIds = tagRecords.map((tag) => ({ id: tag.id }));

    await prisma.post.upsert({
      where: { slug: item.slug },
      update: { ...baseData, tags: { set: tagIds } },
      create: { ...baseData, tags: { connect: tagIds } },
    });
  }
  console.log(`✓ 示例文章 ${posts.length} 篇`);

  const settings = await prisma.siteSetting.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      siteTitle: "山间笔记",
      siteDescription: "记录技术、思考与生活的地方",
      authorName: "山间",
      authorBio:
        "前端开发者，喜欢把复杂的东西讲简单。这里是我的数字花园，用来存放写过的代码、读过的书和一些没想清楚的问题。",
      avatarUrl: null,
      githubUrl: "https://github.com/Aotemo",
    },
  });
  console.log("✓ 站点设置");

  const firstPost = await prisma.post.findUnique({ where: { slug: posts[0].slug } });
  if (firstPost) {
    const topContent = "写得很清楚，尤其是草稿那段，我之前也踩过这个坑。";

    let topComment = await prisma.comment.findFirst({
      where: { postId: firstPost.id, parentId: null, author: "小林" },
    });
    if (!topComment) {
      topComment = await prisma.comment.create({
        data: {
          postId: firstPost.id,
          author: "小林",
          content: topContent,
          approved: true,
        },
      });
    }

    const guestContent = "补充一句：定时发布和草稿最好在后台能一眼区分，不然容易搞混。";
    const guestReply = await prisma.comment.findFirst({
      where: { postId: firstPost.id, parentId: topComment.id, author: "阿树" },
    });
    if (!guestReply) {
      await prisma.comment.create({
        data: {
          postId: firstPost.id,
          parentId: topComment.id,
          replyToName: topComment.author,
          author: "阿树",
          content: guestContent,
          approved: true,
        },
      });
    }

    const adminContent = "同意，后台列表已经用「草稿 / 已发布 / 定时」三种状态区分了。";
    const adminReplyExists = await prisma.comment.findFirst({
      where: { postId: firstPost.id, parentId: topComment.id, isAdmin: true },
    });
    if (!adminReplyExists) {
      await prisma.comment.create({
        data: {
          postId: firstPost.id,
          parentId: topComment.id,
          replyToName: "阿树",
          author: settings.authorName,
          content: adminContent,
          approved: true,
          isAdmin: true,
        },
      });
    }

    const pendingExists = await prisma.comment.findFirst({
      where: { postId: firstPost.id, parentId: null, author: "路人甲" },
    });
    if (!pendingExists) {
      await prisma.comment.create({
        data: {
          postId: firstPost.id,
          author: "路人甲",
          content: "请问部署到 Vercel 的时候 SQLite 需要额外配置吗？",
          approved: false,
        },
      });
    }

    console.log("✓ 示例评论、访客回复与博主回复");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("种子数据写入完成");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
