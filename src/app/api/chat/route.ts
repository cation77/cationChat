import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, images } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const mockResponse = `您好！我是 AI 助手。收到您的消息：${message}

我可以帮助您：
1. 回答问题
2. 编写代码
3. 分析数据
4. 生成图表

这是一个**流式响应**的示例，模拟 SSE 推送。

\`\`\`javascript
const greeting = "Hello, AI Chat!";
console.log(greeting);
\`\`\`

请告诉我您需要什么帮助？`;

        const chunks = chunkText(mockResponse, 50);

        for (const chunk of chunks) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ id: 'msg-1', content: chunk, done: false })}\n`)
          );
          await sleep(100);
        }

        controller.enqueue(encoder.encode('data: {"id": "msg-1", "content": "", "done": true}\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
