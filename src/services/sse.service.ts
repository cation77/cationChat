import { SSEConfig, StreamChunk } from '@/types/chat.types';
import { SSE_EVENTS, API_CONFIG } from '@/lib/constants';

class SSEService {
  private controller: AbortController | null = null;
  private eventSource: EventSource | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  async connect(config: SSEConfig): Promise<void> {
    if (this.isConnected) {
      await this.disconnect();
    }

    this.controller = new AbortController();
    const { url, params, onMessage, onDone, onError } = config;

    try {
      const urlWithParams = new URL(url);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          urlWithParams.searchParams.append(key, value);
        });
      }

      this.eventSource = new EventSource(urlWithParams.toString(), {
        withCredentials: true,
      });

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as StreamChunk;
          onMessage(data);
        } catch {
          onMessage({
            id: '',
            content: event.data,
            done: false,
          });
        }
      };

      this.eventSource.addEventListener(SSE_EVENTS.DONE, () => {
        onDone();
      });

      this.eventSource.addEventListener(SSE_EVENTS.ERROR, (event: MessageEvent) => {
        const error = new Error(event.data || 'SSE Error');
        onError(error);
      });

      this.eventSource.onerror = (error) => {
        if (this.controller?.signal.aborted) {
          return;
        }

        onError(error as unknown as Error);
        this.handleReconnect(config);
      };
    } catch (error) {
      onError(error as Error);
      throw error;
    }
  }

  private handleReconnect(config: SSEConfig): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      config.onError(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.connect(config).catch(() => {});
    }, delay);
  }

  async disconnect(): Promise<void> {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnected = false;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const sseService = new SSEService();

export async function fetchWithReadableStream(
  url: string,
  options: RequestInit = {}
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response.body;
}

export async function* streamReader(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (buffer.trim()) {
          yield buffer;
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          if (data === '[DONE]') {
            return;
          }
          yield data;
        } else if (line.trim()) {
          yield line;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
