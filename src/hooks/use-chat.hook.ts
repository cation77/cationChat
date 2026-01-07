'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import useChatStore from '@/stores/chat.store';
import { SendMessageParams, StreamChunk, Message } from '@/types/chat.types';
import { generateId } from '@/lib/utils';
import { API_CONFIG } from '@/lib/constants';

export function useChat() {
  const store = useChatStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageBufferRef = useRef<string>('');

  const sendMessage = useCallback(async (params: SendMessageParams) => {
    const { content, images } = params;

    if (!content.trim() && (!images || images.length === 0)) {
      return;
    }

    store.sendMessage(params);

    abortControllerRef.current = new AbortController();
    messageBufferRef.current = '';

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, images }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const stream = response.body;
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();

              try {
                const chunk = JSON.parse(data) as StreamChunk;

                if (chunk.type === 'image') {
                  const currentSession = store.sessions.find(s => s.id === store.currentSessionId);
                  const lastMessage = currentSession?.messages.filter(m => m.role === 'assistant').slice(-1)[0];
                  if (lastMessage) {
                    store.updateMessage(chunk.id, {
                      images: [...(lastMessage.images || []), ...(chunk.images || [])],
                    });
                  }
                } else {
                  messageBufferRef.current += chunk.content;
                  store.updateMessage(chunk.id, {
                    content: messageBufferRef.current,
                    status: chunk.done ? 'completed' : 'streaming',
                  });
                }

                if (chunk.done) {
                  store.setStreaming(false);
                  store.setLoading(false);
                }
              } catch {
                if (data === '[DONE]') {
                  store.setStreaming(false);
                  store.setLoading(false);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        const currentSession = store.sessions.find(s => s.id === store.currentSessionId);
        const lastMessage = currentSession?.messages.filter(m => m.role === 'assistant').slice(-1)[0];

        if (lastMessage) {
          store.updateMessage(lastMessage.id, {
            status: 'error',
            error: error.message,
          });
        }
        store.setLoading(false);
        store.setStreaming(false);
      }
    }
  }, [store]);

  const abortStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const currentSession = store.sessions.find(s => s.id === store.currentSessionId);
    const lastMessage = currentSession?.messages.filter(m => m.role === 'assistant').slice(-1)[0];

    if (lastMessage && lastMessage.status === 'streaming') {
      store.updateMessage(lastMessage.id, { status: 'completed' });
    }

    store.setStreaming(false);
    store.setLoading(false);
  }, [store]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...store,
    sendMessage,
    abortStreaming,
  };
}
