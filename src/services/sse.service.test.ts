import { sseService, fetchWithReadableStream, streamReader } from '@/services/sse.service';

describe('sseService', () => {
  describe('connect', () => {
    it('should connect to SSE server', async () => {
      const mockOnMessage = jest.fn();
      const mockOnDone = jest.fn();
      const mockOnError = jest.fn();

      global.EventSource = jest.fn(() => ({
        onopen: jest.fn(),
        onmessage: jest.fn(),
        onerror: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
      })) as any;

      await sseService.connect({
        url: 'http://localhost:3001/sse/chat',
        onMessage: mockOnMessage,
        onDone: mockOnDone,
        onError: mockOnError,
      });

      expect(sseService.getConnectionStatus()).toBe(true);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from SSE server', async () => {
      await sseService.disconnect();
      expect(sseService.getConnectionStatus()).toBe(false);
    });
  });
});

describe('fetchWithReadableStream', () => {
  it('should fetch with readable stream', async () => {
    const mockResponse = new Response('test content', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

    global.fetch = jest.fn(() => Promise.resolve(mockResponse)) as any;

    const stream = await fetchWithReadableStream('http://example.com/api');
    expect(stream).toBeInstanceOf(ReadableStream);
  });
});

describe('streamReader', () => {
  it('should read stream chunks correctly', async () => {
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('chunk 1\n'));
        controller.enqueue(encoder.encode('chunk 2\n'));
        controller.close();
      },
    });

    const chunks: string[] = [];
    for await (const chunk of streamReader(readableStream)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['chunk 1', 'chunk 2']);
  });
});
