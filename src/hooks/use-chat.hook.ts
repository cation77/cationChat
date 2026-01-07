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
  const assistantMessageIdRef = useRef<string>('');
  const isProcessingRef = useRef(false);

  const sendMessage = useCallback(async (params: SendMessageParams) => {
    const { content, images } = params;

    if (!content.trim() && (!images || images.length === 0)) {
      return;
    }

    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    const assistantMessageId = store.sendMessage(params);
    assistantMessageIdRef.current = assistantMessageId;

    await fetchAndStreamResponse(content, images);
  }, [store]);

  const fetchAndStreamResponse = useCallback(async (content: string, images?: string[]) => {
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
                  if (assistantMessageIdRef.current) {
                    const currentSession = store.sessions.find(s => s.id === store.currentSessionId);
                    const lastMessage = currentSession?.messages.filter(m => m.role === 'assistant').slice(-1)[0];
                    if (lastMessage) {
                      store.updateMessage(assistantMessageIdRef.current, {
                        images: [...(lastMessage.images || []), ...(chunk.images || [])],
                      });
                    }
                  }
                } else {
                  messageBufferRef.current += chunk.content;
                  if (assistantMessageIdRef.current) {
                    store.updateMessage(assistantMessageIdRef.current, {
                      content: messageBufferRef.current,
                      status: chunk.done ? 'completed' : 'streaming',
                    });
                  }
                }

                if (chunk.done) {
                  store.setStreaming(false);
                  store.setLoading(false);
                  assistantMessageIdRef.current = '';
                  isProcessingRef.current = false;
                }
              } catch {
                if (data === '[DONE]') {
                  store.setStreaming(false);
                  store.setLoading(false);
                  assistantMessageIdRef.current = '';
                  isProcessingRef.current = false;
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
        if (assistantMessageIdRef.current) {
          store.updateMessage(assistantMessageIdRef.current, {
            status: 'error',
            error: error.message,
          });
        }
        store.setLoading(false);
        store.setStreaming(false);
        assistantMessageIdRef.current = '';
        isProcessingRef.current = false;
      }
    }
  }, [store]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    store.editMessage(messageId, newContent);
    
    const currentSession = store.sessions.find(s => s.id === store.currentSessionId);
    const message = currentSession?.messages.find(m => m.id === messageId);
    
    if (message && message.role === 'user') {
      await fetchAndStreamResponse(newContent, message.images);
    }
  }, [store, fetchAndStreamResponse]);

  const resendMessage = useCallback(async (content: string) => {
    store.resendMessage(content);

    const currentSession = store.sessions.find(s => s.id === store.currentSessionId);
    const lastMessage = currentSession?.messages.filter(m => m.role === 'assistant').slice(-1)[0];
    if (lastMessage) {
      assistantMessageIdRef.current = lastMessage.id;
    }

    await fetchAndStreamResponse(content);
  }, [store, fetchAndStreamResponse]);

  const regenerateMessage = useCallback(async (messageId: string) => {
    const currentSession = store.sessions.find(s => s.id === store.currentSessionId);
    if (!currentSession) return;

    const messageIndex = currentSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const assistantMessage = currentSession.messages[messageIndex];
    if (assistantMessage?.role !== 'assistant') return;

    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;

    const userMessage = currentSession.messages[userMessageIndex];
    if (!userMessage || userMessage.role !== 'user') return;

    await fetchAndStreamResponse(userMessage.content, userMessage.images);
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
    createSession: store.createSession,
    editMessage,
    resendMessage,
    regenerateMessage,
  };
}
