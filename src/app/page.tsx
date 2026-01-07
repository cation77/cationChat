'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { MessageSquare, Sparkles, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            AI Chat Application
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            基于 Next.js 14 构建的现代化 AI 聊天应用，支持流式响应、图片生成和数据分析
          </p>
          <div className="mt-8">
            <Link href="/chat">
              <Button size="lg" className="gap-2">
                <MessageSquare className="w-5 h-5" />
                开始对话
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <Sparkles className="w-10 h-10 text-primary mb-2" />
              <CardTitle>智能对话</CardTitle>
              <CardDescription>
                基于大语言模型的智能对话能力，支持上下文理解和多轮对话
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-10 h-10 text-primary mb-2" />
              <CardTitle>流式响应</CardTitle>
              <CardDescription>
                实时流式输出，AI 回复即刻呈现，告别等待焦虑
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle>数据可视化</CardTitle>
              <CardDescription>
                内置图表组件，支持数据分析和可视化展示
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Built with Next.js 14, TypeScript, shadcn/ui, Ant Design X, and AntV</p>
        </div>
      </div>
    </main>
  );
}
