'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageLoadOptions } from '@/types/chat.types';

interface UseImageCollectorOptions {
  enabled?: boolean;
  timeout?: number;
  onImagesCollected?: (images: HTMLImageElement[]) => void;
}

interface UseImageCollectorReturn {
  images: HTMLImageElement[];
  addImageUrl: (url: string, alt?: string) => Promise<void>;
  clearImages: () => void;
  isLoading: boolean;
  progress: number;
}

export function useImageCollector(
  options: UseImageCollectorOptions = {}
): UseImageCollectorReturn {
  const {
    enabled = true,
    timeout = 5000,
    onImagesCollected,
  } = options;

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const imageUrlsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collectedCountRef = useRef(0);

  const loadImage = useCallback(
    async (url: string, alt?: string): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.alt = alt || '';
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          imageUrlsRef.current.set(url, img);
          resolve(img);
        };

        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          resolve(null);
        };

        img.src = url;
      });
    },
    []
  );

  const addImageUrl = useCallback(
    async (url: string, alt?: string): Promise<void> => {
      if (!enabled) return;

      setIsLoading(true);

      try {
        const img = await loadImage(url, alt);

        if (img) {
          imageUrlsRef.current.set(url, img);
          collectedCountRef.current += 1;
          setImages(Array.from(imageUrlsRef.current.values()));
          setProgress(
            (collectedCountRef.current / imageUrlsRef.current.size) * 100
          );
        }
      } catch (error) {
        console.error('Error loading image:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, loadImage]
  );

  const clearImages = useCallback(() => {
    imageUrlsRef.current.clear();
    collectedCountRef.current = 0;
    setImages([]);
    setProgress(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (timeout > 0 && images.length > 0) {
      timeoutRef.current = setTimeout(() => {
        if (onImagesCollected && images.length > 0) {
          onImagesCollected(images);
        }
      }, timeout);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [images, timeout, onImagesCollected]);

  return {
    images,
    addImageUrl,
    clearImages,
    isLoading,
    progress,
  };
}

export function useLazyImage(options: Partial<ImageLoadOptions> = {}) {
  const { timeout = 5000, retryCount = 3, onLoad, onError } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const loadImage = useCallback(
    async (src: string, alt?: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        imgRef.current = img;
        img.crossOrigin = 'anonymous';
        img.alt = alt || '';

        img.onload = () => {
          setIsLoaded(true);
          onLoad?.(img);
          resolve(true);
        };

        img.onerror = () => {
          setIsError(true);

          if (retryAttempts < retryCount) {
            setRetryAttempts((prev) => prev + 1);
            setTimeout(() => {
              img.src = src;
            }, Math.pow(2, retryAttempts) * 1000);
          } else {
            onError?.(new Event('error'));
            resolve(false);
          }
        };

        if (timeout > 0) {
          const timer = setTimeout(() => {
            if (!isLoaded) {
              img.onerror?.(new Event('timeout'));
              resolve(false);
            }
          }, timeout);
          img.onload = () => clearTimeout(timer);
        }

        img.src = src;
      });
    },
    [retryCount, timeout, onLoad, onError, isLoaded, retryAttempts]
  );

  const reset = useCallback(() => {
    setIsLoaded(false);
    setIsError(false);
    setRetryAttempts(0);
    imgRef.current = null;
  }, []);

  return {
    isLoaded,
    isError,
    retryAttempts,
    loadImage,
    reset,
    imgRef,
  };
}
