'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AIBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  loading?: boolean;
  className?: string;
}

const AIBubble: React.FC<AIBubbleProps> = ({
  content,
  role,
  loading = false,
  className,
}) => {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
        isUser
          ? 'bg-primary text-primary-foreground ml-auto'
          : 'bg-muted text-foreground border',
        className
      )}
    >
      {content}
      {loading && (
        <span className="ml-2 inline-flex">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse mr-1" />
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }} />
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </span>
      )}
    </div>
  );
};

interface AISenderProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

const AISender: React.FC<AISenderProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '输入您的问题...',
  loading = false,
  className,
}) => {
  return (
    <div className={cn('border-t bg-card p-4', className)}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          disabled={loading}
          className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim() || loading}
          className="h-10 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  );
};

export { AIBubble, AISender };
export type { AIBubbleProps, AISenderProps };
