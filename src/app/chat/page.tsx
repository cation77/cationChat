'use client';

import * as React from 'react';
import { useChat } from '@/hooks/use-chat.hook';
import { ChatMessageList, ChatInput, ChatSidebar } from '@/components/chat';
import { ThemeToggle } from '@/components/ui';
import useChatStore from '@/stores/chat.store';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui';
import { AIThinking } from '@/components/ai';
import { useState } from 'react';

interface ChatPageProps {}

const ChatPage: React.FC<ChatPageProps> = () => {
  const store = useChatStore();
  const { sendMessage, abortStreaming, isLoading, isStreaming, createSession, editMessage, resendMessage, regenerateMessage } = useChat();
  const [inputValue, setInputValue] = React.useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentSession = React.useMemo(
    () => store.sessions.find((s) => s.id === store.currentSessionId) || null,
    [store.sessions, store.currentSessionId]
  );

  React.useEffect(() => {
    if (!store.currentSessionId && store.sessions.length === 0) {
      createSession();
    }
  }, [store.currentSessionId, store.sessions.length, createSession]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      sendMessage({ content: inputValue });
      setInputValue('');
    }
  };

  const hasMessages = currentSession && currentSession.messages.length > 0;

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          'flex-shrink-0 transition-all duration-300 ease-in-out bg-card border-r',
          sidebarOpen ? 'w-72' : 'w-16'
        )}
      >
        <ChatSidebar
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onCreateNewChat={() => setInputValue('')}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b h-14 flex items-center px-4 bg-card/50 backdrop-blur-sm">
          <h1 className="text-lg font-semibold truncate text-foreground">
            {currentSession?.title || 'AI Chat'}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {isStreaming && (
              <AIThinking type="points" className="text-sm" />
            )}
            <ThemeToggle />
          </div>
        </header>

        <div className={cn('flex-1 flex flex-col overflow-hidden', hasMessages ? '' : 'items-center justify-center')}>
          <ChatMessageList
            session={currentSession}
            onEdit={editMessage}
            onResend={resendMessage}
            onRegenerate={regenerateMessage}
            className={cn('flex-1', hasMessages ? '' : 'w-full max-w-3xl')}
          />
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            onAbort={abortStreaming}
            isLoading={isLoading}
            isStreaming={isStreaming}
            className={cn(hasMessages ? '' : 'w-full max-w-3xl')}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
