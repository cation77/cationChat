'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';

interface AIThinkingProps {
  loading?: boolean;
  type?: 'spin' | 'points' | 'spinner';
  className?: string;
}

const AIThinking: React.FC<AIThinkingProps> = ({
  loading = true,
  type = 'points',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </span>
      <span>AI 思考中...</span>
    </div>
  );
};

export { AIThinking };
export type { AIThinkingProps };
