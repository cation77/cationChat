'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  isStreaming = false,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [content, isStreaming]);

  return (
    <div
      ref={containerRef}
      className={cn('markdown-body prose prose-sm dark:prose-invert max-w-none', className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const language = match ? match[1] : '';
            const isInline = !codeClassName;

            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group">
                {language && (
                  <div className="absolute right-2 top-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {language}
                  </div>
                )}
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className={codeClassName} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          img({ src, alt, ...props }) {
            return (
              <div className="relative inline-block">
                <img
                  src={src as string}
                  alt={(alt as string) || ''}
                  loading="lazy"
                  className="max-w-full h-auto rounded-lg border"
                  {...props as React.ImgHTMLAttributes<HTMLImageElement>}
                />
                {alt && (
                  <span className="block text-center text-xs text-muted-foreground mt-1">
                    {alt as string}
                  </span>
                )}
              </div>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  {children}
                </table>
              </div>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content || (isStreaming ? '...' : '')}
      </ReactMarkdown>
    </div>
  );
};

export { MarkdownRenderer };
export type { MarkdownRendererProps };
