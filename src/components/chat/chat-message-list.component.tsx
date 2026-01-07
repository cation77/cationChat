'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui';
import { ChatMessage } from './chat-message.component';
import { ChatSession } from '@/types/chat.types';

interface ChatMessageListProps {
  session: ChatSession | null;
  className?: string;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ session, className }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  if (!session) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">开始新的对话</p>
          <p className="text-sm mt-1">在下方输入框中输入您的问题</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1 h-full', className)}>
      <div className="flex flex-col">
        {session.messages.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">开始新的对话</p>
              <p className="text-sm mt-1">在下方输入框中输入您的问题</p>
            </div>
          </div>
        ) : (
          <>
            {session.messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === session.messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export { ChatMessageList };
export type { ChatMessageListProps };
