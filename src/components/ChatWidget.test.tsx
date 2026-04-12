import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ChatWidget from './ChatWidget';
import type { StoredReading } from '@/lib/readingSession';

function createReading(): StoredReading {
  return {
    spreadType: 'three-card',
    spreadName: 'Trải bài ba lá',
    createdAt: '2026-04-12T00:00:00.000Z',
    aiInterpretation: null,
    notes: null,
    clarificationAnswers: null,
    drawnCards: [
      {
        cardId: 1,
        cardName: 'The Magician',
        cardSlug: 'the-magician',
        orientation: 'upright',
        position: 'Hiện tại',
        imagePath: '/cards/the-magician.jpg',
        keywords: ['Khởi đầu', 'Ý chí'],
        uprightMeaning: 'Bạn có đủ nguồn lực để bắt đầu.',
        reversedMeaning: 'Bạn đang phân tán năng lượng.',
        description: 'Lá bài của hành động và ý chí.',
      },
      {
        cardId: 2,
        cardName: 'The Star',
        cardSlug: 'the-star',
        orientation: 'upright',
        position: 'Tương lai',
        imagePath: '/cards/the-star.jpg',
        keywords: ['Hy vọng', 'Cảm hứng'],
        uprightMeaning: 'Hy vọng đang trở lại.',
        reversedMeaning: 'Bạn đang thiếu niềm tin.',
        description: 'Lá bài của hy vọng và hồi phục.',
      },
    ],
  };
}

describe('ChatWidget', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows the reading-aware welcome message with the correct Vietnamese text', async () => {
    sessionStorage.setItem('tarot-current-reading', JSON.stringify(createReading()));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button'));

    expect(
      await screen.findByText(/Mình đang nhìn thấy trải bài "Trải bài ba lá" gần nhất của bạn\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bạn có thể hỏi sâu hơn về The Magician \(Hiện tại\), The Star \(Tương lai\)/i),
    ).toBeInTheDocument();
  });
});
