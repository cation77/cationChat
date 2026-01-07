'use client';

import * as React from 'react';
import { useChat } from '@/hooks/use-chat.hook';
import { ChatMessageList, ChatInput } from '@/components/chat';
import useChatStore from '@/stores/chat.store';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui';
import { AIThinking } from '@/components/ai';

interface ChatPageProps {}

const ChatPage: React.FC<ChatPageProps> = () => {
  const store = useChatStore();
  const { sendMessage, abortStreaming, isLoading, isStreaming } = useChat();
  const [inputValue, setInputValue] = React.useState('');
  const currentSession = React.useMemo(
    () => store.sessions.find((s) => s.id === store.currentSessionId) || null,
    [store.sessions, store.currentSessionId]
  );

  const handleSubmit = () => {
    if (inputValue.trim()) {
      sendMessage({ content: inputValue });
      setInputValue('');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <header className="border-b h-14 flex items-center px-4 bg-card">
          <h1 className="text-lg font-semibold">AI Chat</h1>
          <div className="ml-auto flex items-center gap-2">
            {isStreaming && (
              <AIThinking type="points" className="text-sm" />
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatMessageList
            session={currentSession}
            className="flex-1"
          />
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            onAbort={abortStreaming}
            isLoading={isLoading}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
