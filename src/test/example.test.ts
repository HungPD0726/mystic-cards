import { describe, expect, it } from 'vitest';
import { createStoredReading, buildReadingShareText } from '@/lib/readingSession';
import type { DrawnCard } from '@/data/types';

const mockDrawnCards: DrawnCard[] = [
  {
    card: {
      id: 1,
      name: 'The Magician',
      slug: 'the-magician',
      imagePath: '/cards/the-magician.jpg',
      keywords: ['Khởi đầu', 'Ý chí'],
      uprightMeaning: 'Bạn có đủ nguồn lực để bắt đầu.',
      reversedMeaning: 'Bạn đang phân tán năng lượng.',
      description: 'Lá bài của hành động và ý chí.',
      group: 'major',
    },
    orientation: 'upright',
    position: 'Hiện tại',
    revealed: true,
  },
];

describe('readingSession', () => {
  it('creates a serializable reading payload from drawn cards', () => {
    const storedReading = createStoredReading('one-card', 'Một Lá', mockDrawnCards);

    expect(storedReading.spreadType).toBe('one-card');
    expect(storedReading.spreadName).toBe('Một Lá');
    expect(storedReading.drawnCards).toHaveLength(1);
    expect(storedReading.drawnCards[0]).toMatchObject({
      cardId: 1,
      cardName: 'The Magician',
      position: 'Hiện tại',
      orientation: 'upright',
    });
  });

  it('builds a readable share summary', () => {
    const storedReading = createStoredReading('one-card', 'Một Lá', mockDrawnCards);
    const summary = buildReadingShareText(storedReading, 'Tin vào khả năng chủ động của bạn.');

    expect(summary).toContain('Astral Arcana');
    expect(summary).toContain('Hiện tại: The Magician');
    expect(summary).toContain('Luận giải AI');
  });
});
