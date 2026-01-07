import { create } from 'zustand';
import { ChatState, ChatSession, Message, SendMessageParams } from '@/types/chat.types';
import { generateId } from '@/lib/utils';

interface ChatStore extends ChatState {
  createSession: (title?: string) => string;
  deleteSession: (sessionId: string) => void;
  selectSession: (sessionId: string) => void;
  sendMessage: (params: SendMessageParams) => string;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  addMessage: (message: Message) => void;
  clearCurrentSession: () => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  appendToLastMessage: (content: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  resendMessage: (content: string) => string;
}

const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  isStreaming: false,

  createSession: (title = '新对话') => {
    const sessionId = generateId();
    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: sessionId,
    }));

    return sessionId;
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      currentSessionId: state.currentSessionId === sessionId
        ? null
        : state.currentSessionId,
    }));
  },

  selectSession: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  sendMessage: ({ content, images = [] }) => {
    let assistantMessageId = '';
    set((state) => {
      let sessionId = state.currentSessionId;
      let sessionIndex = state.sessions.findIndex((s) => s.id === sessionId);

      if (sessionIndex === -1) {
        sessionId = generateId();
        const newSession: ChatSession = {
          id: sessionId,
          title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        sessionIndex = 0;
        return {
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
          isLoading: true,
          isStreaming: true,
        };
      }

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        images,
        timestamp: Date.now(),
        status: 'completed',
      };

      assistantMessageId = generateId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'streaming',
      };

      const sessions = [...state.sessions];
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        messages: [...sessions[sessionIndex].messages, userMessage, assistantMessage],
        updatedAt: Date.now(),
      };

      return { sessions, isLoading: true, isStreaming: true };
    });

    return assistantMessageId;
  },

  updateMessage: (messageId, updates) => {
    set((state) => ({
      sessions: state.sessions.map((session) => ({
        ...session,
        messages: session.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      })),
    }));
  },

  addMessage: (message) => {
    set((state) => {
      if (!state.currentSessionId) {
        const newSession: ChatSession = {
          id: generateId(),
          title: message.role === 'user' ? message.content.slice(0, 30) : '新对话',
          messages: [message],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return {
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        };
      }

      return {
        sessions: state.sessions.map((session) =>
          session.id === state.currentSessionId
            ? {
                ...session,
                messages: [...session.messages, message],
                updatedAt: Date.now(),
              }
            : session
        ),
      };
    });
  },

  clearCurrentSession: () => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === state.currentSessionId
          ? { ...session, messages: [] }
          : session
      ),
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),

  appendToLastMessage: (content) => {
    set((state) => {
      if (!state.currentSessionId) return state;

      return {
        sessions: state.sessions.map((session) => {
          if (session.id !== state.currentSessionId) return session;

          const messages = [...session.messages];
          const lastMessage = messages[messages.length - 1];

          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + content,
            };
          }

          return { ...session, messages };
        }),
      };
    });
  },

  editMessage: (messageId, newContent) => {
    set((state) => ({
      sessions: state.sessions.map((session) => ({
        ...session,
        messages: session.messages.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        ),
      })),
    }));
  },

  resendMessage: (content) => {
    set((state) => {
      let sessionId = state.currentSessionId;
      let sessionIndex = state.sessions.findIndex((s) => s.id === sessionId);

      if (sessionIndex === -1) {
        sessionId = generateId();
        const newSession: ChatSession = {
          id: sessionId,
          title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        sessionIndex = 0;
        return {
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
          isLoading: true,
          isStreaming: true,
        };
      }

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'completed',
      };

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'streaming',
      };

      const sessions = [...state.sessions];
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        messages: [...sessions[sessionIndex].messages, userMessage, assistantMessage],
        updatedAt: Date.now(),
      };

      return { sessions, isLoading: true, isStreaming: true };
    });
  },
}));

export default useChatStore;
export type { ChatStore };
