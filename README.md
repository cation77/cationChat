# AI Chat Application

This is an AI chat application built with Next.js 14, TypeScript, and modern UI libraries.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui, Ant Design X
- **Styling**: Tailwind CSS, SCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: AntV
- **Markdown**: react-markdown
- **Package Manager**: pnpm

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 💬 Real-time AI chat with streaming responses
- 🖼️ Image upload and display
- 📊 Data visualization with AntV charts
- 🎨 Markdown rendering with syntax highlighting
- 🌙 Dark mode support (shadcn/ui)
- 📱 Responsive design

## Testing

### Testing Framework

- **Jest**: JavaScript testing framework
- **React Testing Library**: UI component testing
- **TS-Jest**: TypeScript support for Jest
- **@testing-library/jest-dom**: DOM testing utilities

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test path/to/test/file
```

### Code Coverage

The project uses Jest's built-in coverage reporter to generate code coverage reports.

```bash
# Generate coverage report
pnpm test:coverage
```

Coverage reports will be generated in the `coverage/` directory. You can view the HTML report by opening `coverage/lcov-report/index.html` in your browser.

### Test Structure

Tests are organized alongside the source code in the same directory structure with a `.test.ts` or `.test.tsx` extension.

```
src/
├── components/
│   └── chat/
│       ├── chat-message.component.tsx
│       └── chat-message.component.test.tsx  # Test file
├── hooks/
│   ├── use-chat.hook.ts
│   └── use-chat.hook.test.ts                # Test file
└── services/
    ├── sse.service.ts
    └── sse.service.test.ts                  # Test file
```

### Adding New Tests

1. Create a test file with the same name as the source file, but with `.test.ts` or `.test.tsx` extension
2. Use React Testing Library for component tests
3. Use Jest for utility and service tests
4. Follow the existing test patterns

### Test Scripts

| Script | Description |
|--------|-------------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:ci` | Run tests in CI mode (no watch, with coverage) |

## CI/CD

The project includes GitHub Actions workflows for:

- Running tests on every push and pull request
- Generating code coverage reports
- Enforcing coverage thresholds

### Coverage Thresholds

The project has the following coverage thresholds:

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%
