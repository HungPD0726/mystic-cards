import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TarotChat } from './TarotChat';
import { generateTarotChatReplyAI } from '@/lib/aiService';

vi.mock('@/lib/aiService', () => ({
  generateTarotChatReplyAI: vi.fn(),
}));

const generateTarotChatReplyAIMock = vi.mocked(generateTarotChatReplyAI);

const drawnCards = [
  {
    cardName: 'The Magician',
    orientation: 'upright',
    position: 'Hiện tại',
    uprightMeaning: 'Bạn có đủ nguồn lực để bắt đầu.',
    reversedMeaning: 'Bạn đang phân tán năng lượng.',
    keywords: ['Khởi đầu', 'Ý chí'],
  },
];

describe('TarotChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateTarotChatReplyAIMock.mockResolvedValue('Đây là phản hồi tiếp theo.');
  });

  it('sends the full reading context separately from the user transcript', async () => {
    const interpretation = 'Luận giải đầy đủ '.repeat(40);

    render(
      <TarotChat
        drawnCards={drawnCards}
        spreadName="Trải bài ba lá"
        initialInterpretation={interpretation}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Trò chuyện với AI/i }));
    await screen.findByText(/Chào bạn!/i);

    fireEvent.change(screen.getByPlaceholderText(/Hỏi thêm về trải bài này/i), {
      target: { value: 'Tôi nên chú ý điều gì?' },
    });
    fireEvent.click(screen.getAllByRole('button').find((button) => button.getAttribute('type') === 'submit')!);

    await waitFor(() => expect(generateTarotChatReplyAIMock).toHaveBeenCalledTimes(1));

    const [messages, context] = generateTarotChatReplyAIMock.mock.calls[0];

    expect(messages.some((message) => message.content.includes('[CONTEXT]'))).toBe(false);
    expect(context).toEqual({
      spreadName: 'Trải bài ba lá',
      interpretation,
      drawnCards,
    });
  });
});
