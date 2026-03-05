import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";

const allowedElements = new Set([
  "p",
  "strong",
  "em",
  "del",
  "a",
  "ul",
  "ol",
  "li",
  "h3",
  "code",
  "br",
  "blockquote",
  "hr",
  "pre",
  "u",
]);

const components: Components = {
  // Inline formatting
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
  u: ({ children }) => <u className="underline underline-offset-2">{children}</u>,
  // Open links in new tab
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline underline-offset-2 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      {...props}
    >
      {children}
    </a>
  ),
  // Only allow h3 — demote everything else
  h1: ({ children }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>
  ),
  h4: ({ children }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>
  ),
  h5: ({ children }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>
  ),
  h6: ({ children }) => (
    <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 ml-5 list-disc space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-5 list-decimal space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
      {children}
    </code>
  ),
  // Block-level elements
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-muted-foreground/30 pl-3 text-sm italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-t border-border" />,
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-md bg-muted px-3 py-2 text-sm">
      <code className="font-mono">{children}</code>
    </pre>
  ),
  // Unsupported elements
  img: () => null,
  table: () => null,
  thead: () => null,
  tbody: () => null,
  tr: () => null,
  th: () => null,
  td: () => null,
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={`leading-relaxed ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
        allowedElements={[...allowedElements, "h1", "h2", "h4", "h5", "h6", "pre", "img", "table", "thead", "tbody", "tr", "th", "td", "blockquote", "hr", "u"]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
