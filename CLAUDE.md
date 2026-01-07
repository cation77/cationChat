# CLAUDE.md — AI Chat 应用开发规范 v1.0

## 项目信息

- 项目名称: AI Chat Application
- 项目类型: Web应用
- 主要语言: TypeScript
- 框架: Next.js 14 (App Router), React 18
- 包管理器: pnpm

## 常用命令

```
pnpm install     # 安装依赖
pnpm dev         # 启动开发环境
pnpm build       # 构建生产版本
pnpm lint        # 代码检查
pnpm type-check  # 类型检查
```

## 命名规范

### 文件命名

- 格式: [功能]-[描述].[类型].[ext]
- 全小写，中划线分隔
- 类型后缀: .component .service .utils .config .types .test .spec
- 示例:
  - chat-message.component.tsx
  - stream.service.ts

### 文件夹命名

- 格式: kebab-case (全小写，中划线分隔)
- 禁止: 大写字母、空格
- 层级: 最多 4 层深度
- 单文件直接放父目录，不单独建文件夹

## 目录结构

```
src/
  app/                    # Next.js App Router
    api/                  # API 路由
    chat/                 # 聊天页面
    globals.scss          # 全局样式
    layout.tsx            # 根布局
    page.tsx              # 首页
  components/
    chat/                 # 聊天相关组件
    ui/                   # 基础 UI 组件 (shadcn)
    ai/                   # AI 组件 (ant design x)
    chart/                # 图表组件 (antv)
  lib/                    # 工具库
    utils.ts              # 公共工具函数
    constants.ts          # 常量定义
  hooks/                  # 自定义 Hooks
    use-chat.hook.ts      # 聊天相关 Hook
    use-stream.hook.ts    # 流式处理 Hook
  stores/                 # Zustand 状态管理
    chat.store.ts         # 聊天状态
  services/               # 服务层
    sse.service.ts        # SSE 服务
    api.service.ts        # API 服务
  types/                  # 类型定义
    chat.types.ts         # 聊天相关类型
    stream.types.ts       # 流式相关类型
  styles/                 # 样式文件
    _variables.scss       # SCSS 变量
    _mixins.scss          # SCSS 混入
  config/                 # 配置文件
    theme.config.ts       # 主题配置
```

## 技术栈

- **框架**: Next.js 14 + TypeScript
- **UI**: shadcn/ui + Ant Design X
- **样式**: Tailwind CSS + SCSS
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **表格**: TanStack Table
- **图表**: AntV (G2, G6)
- **Markdown**: react-markdown + remark-gfm
- **流式处理**: ReadableStream + SSE
- **图标**: Lucide React

## 代码复用

IMPORTANT: 禁止重复实现已有功能

- 相同代码出现 2 次 → 必须提取为公共函数
- 超过 10 行的业务逻辑 → 考虑复用
- 简单条件判断 → 不必过度抽象
- 新建文件前 → 先搜索是否已有类似功能
- 公共模块禁止依赖业务模块，避免循环依赖

## 代码健壮性

### 错误处理

- 异步操作必须有错误处理机制
- 错误分类处理:
  - 验证错误 → 返回字段级详情
  - 业务错误 → 返回用户友好提示
  - 系统错误 → 记录日志，返回通用错误
- 错误向上传播时补充上下文信息

### 输入验证

- 所有外部输入必须验证 (API 参数、用户输入、文件内容)
- 使用成熟的验证库
- 验证失败返回明确错误信息

### 边界检查

- 集合/数组访问前检查索引边界
- 除法前检查除数非零
- 空值检查 (null/undefined)
- 类型转换前验证数据有效性
- 资源申请后确保释放 (连接、文件句柄等)

## 修改原则

IMPORTANT: 根本解决问题

- 找到 root cause，从根本上解决
- 正面面对问题，不绕过不回避
- 复杂问题先说明根本原因，再讨论方案
- 禁止打补丁、用 hack、投机取巧
- 禁止因为"能跑"就不深究

### 代码清理

- 废弃代码: 确认无引用 → 直接删除
- 重复实现: 统一为一个 → 删除其余
- 死代码: 注释代码块、未使用的变量/函数 → 删除
- 历史遗留: 开发阶段大胆重构，不背历史包袱
- 不保留"以防万一"的代码

### 修改范围

- 只改必要文件，不顺便改无关代码
- 修改前先理解现有代码意图
- 修改后运行相关测试确认无回归

## 配置管理

- 敏感信息: 环境变量注入，禁止硬编码
- 优先级: 环境变量 > 配置文件 > 默认值
- 环境隔离: dev / test / prod 配置独立

## 文档与注释

- 公共函数/方法: 文档注释说明参数、返回值、异常
- 业务逻辑: 注释说明"为什么"而非"做什么"
- 复杂算法: 注释解释核心思路
- 代码变更: 同步更新相关文档

## 禁止事项

- 硬编码密钥、密码、敏感信息
- 提交调试输出语句到代码库
- 单文件单独建文件夹
- 公共模块依赖业务模块
- 用错误处理吞掉异常假装没问题
- 用条件判断绕过 bug 而不修复
- 复制粘贴已有代码而不复用
- 保留"以防万一"的废弃代码
- 删除或跳过失败的测试来让构建通过

## 语言/框架特定规则

### TypeScript 项目

- 启用 strict 模式
- 禁止 any，使用 unknown + 类型守卫
- 禁止 @ts-ignore
- 使用 ES modules (import/export)

### Next.js 项目

- 使用 App Router 架构
- Server Components 和 Client Components 明确区分
- API 路由使用 Next.js Route Handlers
- 静态资源放在 public 目录

### Tailwind CSS

- 使用 @apply 指令简化重复样式
- 自定义主题颜色在 tailwind.config.js 中配置
- 响应式设计使用标准断点

### SCSS

- 使用 _ 前缀命名变量文件
- 避免深度选择器嵌套
- 使用混入 (mixins) 复用样式模式
