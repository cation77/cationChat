'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useImageCollector } from '@/hooks/use-image-collector.hook';
import { ImageChunk } from '@/types/chat.types';

interface ImageCollectorProps {
  images: string[];
  alt?: string;
  className?: string;
  onAllImagesLoaded?: (images: HTMLImageElement[]) => void;
}

const ImageCollector: React.FC<ImageCollectorProps> = ({
  images,
  alt = 'AI Generated Image',
  className,
  onAllImagesLoaded,
}) => {
  const { images: loadedImages, isLoading, progress } = useImageCollector({
    enabled: images.length > 0,
    timeout: 5000,
    onImagesCollected: onAllImagesLoaded,
  });

  React.useEffect(() => {
    if (images.length > 0) {
      images.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [images]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>加载图片中...</span>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div
        className={cn(
          'grid gap-2',
          images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        )}
      >
        {images.map((src, index) => (
          <div key={index} className="relative group">
            <img
              src={src}
              alt={`${alt} ${index + 1}`}
              loading="lazy"
              className="w-full h-auto rounded-lg border shadow-sm transition-opacity duration-300"
              style={{ opacity: loadedImages.some((img) => (img as HTMLImageElement).src === src) ? 1 : 0 }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.opacity = '1';
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.5';
                (e.target as HTMLImageElement).alt = '图片加载失败';
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm hover:underline"
              >
                查看原图
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ImageCollector };
export type { ImageCollectorProps };
