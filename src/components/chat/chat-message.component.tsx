"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { cn, formatTime } from "@/lib/utils";
import { Message } from "@/types/chat.types";
import { MarkdownRenderer } from "./markdown-renderer.component";
import { ImageCollector } from "./image-collector.component";
import { Copy, Edit2, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
  isLastUserMessage?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onResend?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
}

const roleConfig = {
  user: {
    avatar: "/avatars/user.svg",
    fallback: "",
    className: "justify-end",
    bubbleClassName:
      "bg-primary text-primary-foreground  rounded-tl-3xl rounded-tr-[4px] rounded-bl-3xl rounded-br-3xl",
  },
  assistant: {
    avatar: "/avatars/ai.svg",
    fallback: "AI",
    className: "justify-start",
    bubbleClassName: "bg-muted/50 text-card-foreground border border-border",
  },
  system: {
    avatar: null,
    fallback: "",
    className: "justify-center",
    bubbleClassName: "bg-muted text-muted-foreground text-center",
  },
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatest = false,
  isLastUserMessage = false,
  onEdit,
  onResend,
  onRegenerate,
}) => {
  const config = roleConfig[message.role];
  const showStreamingIndicator = isLatest && message.status === "streaming";
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(message.content);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleEditSave = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleResend = () => {
    if (onResend && message.role === "user") {
      onResend(message.content);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && message.role === "assistant") {
      onRegenerate(message.id);
    }
  };

  const canEdit = message.role === "user" && isLastUserMessage;
  const canRegenerate = message.role === "assistant" && isLatest;

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors group",
        config.className
      )}
    >
      {message.role === "user" && !isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-accent text-foreground hover:text-accent-foreground"
            onClick={handleCopy}
            title="复制"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-accent text-foreground hover:text-accent-foreground"
              onClick={() => setIsEditing(true)}
              title="编辑"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex flex-col",
          message.role === "user" ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm relative group",
            config.bubbleClassName
          )}
        >
          {message.images && message.images.length > 0 && (
            <ImageCollector images={message.images} className="mb-2" />
          )}

          {isEditing ? (
            <div className="w-full">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[100px] p-2 rounded-lg bg-background text-foreground border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleEditSave} className="h-8">
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEditCancel}
                  className="h-8"
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <>
              {message.role !== "user" && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {config.avatar && <AvatarImage src={config.avatar} />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {config.fallback}
                  </AvatarFallback>
                </Avatar>
              )}
              <MarkdownRenderer
                content={message.content}
                isStreaming={message.status === "streaming"}
              />
            </>
          )}
        </div>

        {message.status === "error" && (
          <div className="text-destructive text-xs mt-1.5">发送失败</div>
        )}
        {showStreamingIndicator && (
          <div className="flex items-center gap-1 text-primary text-xs mt-1.5">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            AI 思考中...
          </div>
        )}
      </div>

      {message.role === "assistant" && (
        <div
          className={cn(
            "flex items-center gap-1 opacity-100 hover:opacity-100 transition-opacity"
          )}
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-accent text-foreground hover:text-accent-foreground"
            onClick={handleCopy}
            title="复制"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          {canRegenerate && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-accent text-foreground hover:text-accent-foreground"
              onClick={handleRegenerate}
              title="重新生成"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export { ChatMessage };
export type { ChatMessageProps };
