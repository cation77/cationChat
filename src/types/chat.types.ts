export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
  timestamp: number;
  status: 'pending' | 'streaming' | 'completed' | 'error';
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
}

export interface SendMessageParams {
  content: string;
  images?: string[];
}

export interface StreamChunk {
  id: string;
  content: string;
  done: boolean;
  type?: 'text' | 'image' | 'chart' | 'error';
  images?: string[];
}

export interface ImageChunk {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: Record<string, unknown>[];
  options?: Record<string, unknown>;
}

export interface SSEConfig {
  url: string;
  params?: Record<string, string>;
  onMessage: (chunk: StreamChunk) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export interface MarkdownRenderingOptions {
  skipHtml: boolean;
  linkTarget: string;
  breaks: boolean;
  typographer: boolean;
}

export interface ImageLoadOptions {
  timeout: number;
  retryCount: number;
  onLoad?: (image: HTMLImageElement) => void;
  onError?: (error: Event) => void;
}
