import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';

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
    const messageId = generateId();
    const stream = new ReadableStream({
      async start(controller) {
        const mockResponse = generateMockResponse(message);
        const chunks = chunkTextRandom(mockResponse, 30, 70);

        for (const chunk of chunks) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ id: messageId, content: chunk, done: false })}\n`)
          );
          await sleep(1000);
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: messageId, content: '', done: true })}\n`));
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

function generateMockResponse(userMessage: string): string {
  const responses = [
    `您好！我是 AI 助手。收到您的消息："${userMessage}"

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

请告诉我您需要什么帮助？我随时准备为您提供专业的技术支持和解决方案。`,

    `感谢您的提问："${userMessage}"

作为 AI 助手，我很乐意为您提供帮助。以下是我可以协助您的几个方面：

**技术支持**
- 前端开发（React、Vue、Angular）
- 后端开发（Node.js、Python、Java）
- 数据库设计与优化
- API 设计与开发

**数据分析**
- 数据可视化
- 统计分析
- 趋势预测
- 报告生成

**其他服务**
- 代码审查
- 性能优化
- 架构设计
- 问题排查

请告诉我您具体需要哪方面的帮助，我会尽力为您提供详细和准确的解答。`,

    `收到消息："${userMessage}"

您好！我是您的 AI 智能助手。我可以协助您完成各种任务，包括：

📝 **内容创作**
- 撰写文章、博客、文档
- 生成营销文案
- 翻译多语言内容

💻 **技术开发**
- 编写和调试代码
- 解释技术概念
- 提供最佳实践建议
- 代码重构建议

📊 **数据分析**
- 数据清洗和预处理
- 生成可视化图表
- 统计分析
- 趋势预测

🎯 **问题解决**
- 排查技术问题
- 优化性能瓶颈
- 提供解决方案
- 最佳实践建议

请随时告诉我您的需求，我会尽力为您提供专业、准确、有用的回答！`,

    `"${userMessage}" - 这是一个很好的问题！

让我为您详细解答：

首先，我们需要理解这个问题的背景和上下文。从您的描述来看，这涉及到几个关键点：

1. **核心概念**：这是理解问题的基础
2. **实际应用**：如何在实践中使用
3. **注意事项**：需要避免的常见错误

**详细说明**

在实际开发中，我们通常采用以下方法：

\`\`\`typescript
interface Example {
  id: string;
  name: string;
  value: number;
}

const example: Example = {
  id: '1',
  name: 'Test',
  value: 100
};
\`\`\`

**最佳实践**

- 保持代码简洁清晰
- 添加必要的注释
- 遵循团队规范
- 编写单元测试

希望这个解答对您有帮助！如果您还有其他问题，请随时提问。`,

    `您好！收到您的消息："${userMessage}"

作为 AI 助手，我很高兴为您服务。以下是我可以提供的主要功能：

**💡 智能问答**
- 回答各类技术问题
- 解释复杂概念
- 提供学习资源
- 分享最佳实践

**🔧 代码协助**
- 编写示例代码
- 调试错误
- 代码优化建议
- 架构设计指导

**📈 数据处理**
- 数据分析
- 生成图表
- 统计报告
- 趋势分析

**📚 文档支持**
- 技术文档编写
- API 文档生成
- 用户手册制作
- 知识库整理

请告诉我您具体需要什么帮助，我会尽力提供详细、准确、实用的回答！`
  ];

  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

function chunkTextRandom(text: string, minSize: number, maxSize: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const randomSize = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    chunks.push(text.slice(i, i + randomSize));
    i += randomSize;
  }
  return chunks;
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
