'use client';

import * as React from 'react';
import { Plus, MessageSquare, Trash2, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button.component';
import { ScrollArea } from '@/components/ui/scroll-area.component';
import { cn } from '@/lib/utils';
import useChatStore from '@/stores/chat.store';

interface ChatSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  onCreateNewChat?: () => void;
}

export function ChatSidebar({ className, collapsed = false, onToggle, onCreateNewChat }: ChatSidebarProps) {
  const { sessions, currentSessionId, createSession, selectSession, deleteSession } = useChatStore();
  const [hoveredSessionId, setHoveredSessionId] = React.useState<string | null>(null);

  const handleCreateNewChat = () => {
    if (!currentSessionId) {
      return;
    }
    createSession('新对话');
    onCreateNewChat?.();
  };

  const handleSelectSession = (sessionId: string) => {
    selectSession(sessionId);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  if (collapsed) {
    return (
      <div className={cn('flex flex-col h-full bg-card border-r w-16 items-center py-4', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="mb-4 text-foreground"
          title="展开侧边栏"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <Button
          onClick={handleCreateNewChat}
          variant="outline"
          size="icon"
          className="mb-4 text-foreground"
          title="新建对话"
        >
          <Plus className="h-5 w-5" />
        </Button>

        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-2 px-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                onMouseEnter={() => setHoveredSessionId(session.id)}
                onMouseLeave={() => setHoveredSessionId(null)}
                className={cn(
                  'group relative w-10 h-10 rounded-lg cursor-pointer transition-all flex items-center justify-center',
                  'hover:bg-accent',
                  currentSessionId === session.id && 'bg-accent'
                )}
                title={session.title}
              >
                <MessageSquare className={cn('h-5 w-5', currentSessionId === session.id ? 'text-foreground' : 'text-muted-foreground')} />
                {hoveredSessionId === session.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-1 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-foreground"
                    onClick={(e) => handleDeleteSession(e, session.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-card border-r w-72', className)}>
      <div className="p-4 border-b flex items-center justify-between">
        <Button
          onClick={handleCreateNewChat}
          className="flex-1 justify-start gap-2 text-foreground"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          新建对话
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-2 text-foreground"
          title="收起侧边栏"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm text-foreground">暂无对话</p>
              <p className="text-xs mt-1 text-foreground">点击上方按钮开始新对话</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                onMouseEnter={() => setHoveredSessionId(session.id)}
                onMouseLeave={() => setHoveredSessionId(null)}
                className={cn(
                  'group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all',
                  'hover:bg-accent',
                  currentSessionId === session.id && 'bg-accent'
                )}
              >
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    'text-sm font-medium truncate',
                    currentSessionId === session.id ? 'text-foreground' : 'text-foreground'
                  )}>
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(session.updatedAt)}
                    </span>
                    {session.messages.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        · {session.messages.length} 条消息
                      </span>
                    )}
                  </div>
                </div>

                {hoveredSessionId === session.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteSession(e, session.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          共 {sessions.length} 个对话
        </div>
      </div>
    </div>
  );
}
