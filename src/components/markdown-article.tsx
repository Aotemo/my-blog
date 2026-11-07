/* eslint-disable @next/next/no-img-element */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

export function MarkdownArticle({ content }: { content: string }) {
  return (
    <div className="prose-article">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          a({ href, title, children }) {
            const isExternal = Boolean(href && /^https?:\/\//i.test(href));
            return (
              <a
                href={href}
                title={title}
                {...(isExternal ? { target: "_blank", rel: "noreferrer noopener" } : {})}
              >
                {children}
              </a>
            );
          },
          img({ src, alt, title }) {
            return <img src={src} alt={alt ?? ""} title={title} loading="lazy" />;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
