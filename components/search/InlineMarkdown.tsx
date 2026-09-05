import Markdown from "react-markdown";

/**
 * Renders a single line of the search agent's real description text,
 * letting backtick-wrapped technical terms render as styled inline code
 * instead of literal backticks. No block elements — this is one line.
 */
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <Markdown
      components={{
        p: ({ children }) => <>{children}</>,
        code: ({ children }) => (
          <code className="break-all rounded bg-soft px-1 py-0.5 font-mono text-[0.85em] text-ember-700">
            {children}
          </code>
        ),
      }}
    >
      {children}
    </Markdown>
  );
}
