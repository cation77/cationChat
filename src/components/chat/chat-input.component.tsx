'use client';

import * as React from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Send, StopCircle, ImagePlus, X } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAbort: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  className?: string;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onAbort,
  isLoading,
  isStreaming,
  className,
  placeholder = '输入您的问题...',
}) => {
  const [images, setImages] = React.useState<string[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || images.length > 0) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() || images.length > 0) {
      onSubmit();
      setImages([]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  return (
    <div className={cn('border-t bg-card p-4', className)}>
      {images.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {images.map((src, index) => (
            <div key={index} className="relative group">
              <img
                src={src}
                alt={`Uploaded ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={isLoading}
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isLoading}
              className="h-10 w-10"
            >
              <ImagePlus className="w-5 h-5" />
            </Button>
          </label>
        </div>

        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isLoading && !isStreaming}
          />
        </div>

        {(isLoading || isStreaming) ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onAbort}
            className="h-10"
          >
            <StopCircle className="w-5 h-5 mr-2" />
            停止
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() && images.length === 0}
            className="h-10"
          >
            <Send className="w-5 h-5 mr-2" />
            发送
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground mt-2 text-center">
        按 Enter 发送，Shift + Enter 换行
      </div>
    </div>
  );
};

export { ChatInput };
export type { ChatInputProps };
