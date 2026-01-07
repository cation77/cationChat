'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui';
import { ChatMessage } from './chat-message.component';
import { ChatSession } from '@/types/chat.types';

interface ChatMessageListProps {
  session: ChatSession | null;
  className?: string;
  onEdit?: (messageId: string, newContent: string) => void;
  onResend?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ 
  session, 
  className,
  onEdit,
  onResend,
  onRegenerate
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const lastUserMessageId = React.useMemo(() => {
    if (!session) return null;
    const userMessages = session.messages.filter(m => m.role === 'user');
    return userMessages.length > 0 ? userMessages[userMessages.length - 1].id : null;
  }, [session?.messages]);

  const lastAssistantMessageId = React.useMemo(() => {
    if (!session) return null;
    const assistantMessages = session.messages.filter(m => m.role === 'assistant');
    return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].id : null;
  }, [session?.messages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  if (!session) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium text-foreground">开始新的对话</p>
          <p className="text-sm mt-1 text-foreground">在下方输入框中输入您的问题</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1 h-full', className)}>
      <div className="flex flex-col">
        {session.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium text-foreground">开始新的对话</p>
              <p className="text-sm mt-1 text-foreground">在下方输入框中输入您的问题</p>
            </div>
          </div>
        ) : (
          <>
            {session.messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === session.messages.length - 1}
                isLastUserMessage={message.id === lastUserMessageId}
                onEdit={onEdit}
                onResend={onResend}
                onRegenerate={onRegenerate}
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
