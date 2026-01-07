'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { cn, formatTime } from '@/lib/utils';
import { Message } from '@/types/chat.types';
import { MarkdownRenderer } from './markdown-renderer.component';
import { ImageCollector } from './image-collector.component';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

const roleConfig = {
  user: {
    avatar: '/avatars/user.png',
    fallback: 'U',
    className: 'justify-end',
    bubbleClassName: 'bg-primary text-primary-foreground',
  },
  assistant: {
    avatar: '/avatars/ai.png',
    fallback: 'AI',
    className: 'justify-start',
    bubbleClassName: 'bg-card text-card-foreground border',
  },
  system: {
    avatar: null,
    fallback: 'S',
    className: 'justify-center',
    bubbleClassName: 'bg-muted text-muted-foreground text-center',
  },
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest = false }) => {
  const config = roleConfig[message.role];
  const showStreamingIndicator = isLatest && message.status === 'streaming';

  return (
    <div className={cn('flex gap-3 p-4', config.className)}>
      {message.role !== 'user' && (
        <Avatar className="w-8 h-8">
          {config.avatar && <AvatarImage src={config.avatar} />}
          <AvatarFallback>{config.fallback}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col max-w-[70%]', message.role === 'user' ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 shadow-sm',
            config.bubbleClassName
          )}
        >
          {message.images && message.images.length > 0 && (
            <ImageCollector images={message.images} className="mb-2" />
          )}
          <MarkdownRenderer
            content={message.content}
            isStreaming={message.status === 'streaming'}
          />
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{formatTime(new Date(message.timestamp))}</span>
          {message.status === 'error' && (
            <span className="text-destructive">发送失败</span>
          )}
          {showStreamingIndicator && (
            <span className="flex items-center gap-1 text-primary">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              AI 思考中...
            </span>
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <Avatar className="w-8 h-8">
          <AvatarFallback>{config.fallback}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export { ChatMessage };
export type { ChatMessageProps };
