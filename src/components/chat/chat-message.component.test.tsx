import { render, screen } from '@testing-library/react';
import { ChatMessage } from '@/components/chat';
import { Message } from '@/types/chat.types';

describe('ChatMessage', () => {
  const mockMessage: Message = {
    id: 'test-123',
    role: 'user',
    content: 'Hello, AI!',
    timestamp: Date.now(),
    status: 'completed',
  };

  it('should render user message correctly', () => {
    render(<ChatMessage message={mockMessage} />);
    expect(screen.getByText('Hello, AI!')).toBeTruthy();
    expect(screen.getByText('Hello, AI!')).toHaveClass('bg-primary');
  });

  it('should render assistant message correctly', () => {
    render(
      <ChatMessage
        message={{
          ...mockMessage,
          role: 'assistant',
          content: 'Hello, User!',
        }}
      />
    );
    expect(screen.getByText('Hello, User!')).toBeInTheDocument();
    expect(screen.getByText('Hello, User!')).toHaveClass('bg-muted');
  });

  it('should render streaming status correctly', () => {
    render(
      <ChatMessage
        message={{
          ...mockMessage,
          role: 'assistant',
          status: 'streaming',
          content: 'Hello',
        }}
        isLatest
      />
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText(/AI 思考中/i)).toBeInTheDocument();
  });

  it('should render error status correctly', () => {
    render(
      <ChatMessage
        message={{
          ...mockMessage,
          role: 'assistant',
          status: 'error',
          content: 'Error message',
          error: 'Failed to send message',
        }}
      />
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('发送失败')).toBeInTheDocument();
  });

  it('should render images correctly', () => {
    render(
      <ChatMessage
        message={{
          ...mockMessage,
          role: 'assistant',
          images: ['https://example.com/image.jpg'],
          content: 'Here is an image',
        }}
      />
    );
    expect(screen.getByText('Here is an image')).toBeInTheDocument();
    expect(screen.getByAltText(/AI Generated Image 1/i)).toBeInTheDocument();
  });
});
