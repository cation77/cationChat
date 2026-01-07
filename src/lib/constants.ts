export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  SSE_URL: process.env.NEXT_PUBLIC_SSE_URL || '/api/chat',
  TIMEOUT: 30000,
} as const;

export const CHAT_CONFIG = {
  MAX_MESSAGES: 100,
  TYPING_DEBOUNCE: 1000,
  STREAM_CHUNK_DELAY: 30,
  IMAGE_COLLECT_TIMEOUT: 5000,
} as const;

export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  CODE: 'code',
  CHART: 'chart',
  ERROR: 'error',
} as const;

export const SSE_EVENTS = {
  CONNECT: 'connected',
  MESSAGE: 'message',
  ERROR: 'error',
  DONE: 'done',
  IMAGE: 'image',
} as const;
