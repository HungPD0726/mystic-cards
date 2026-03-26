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
      keywords: ['Khoi dau', 'Y chi'],
      uprightMeaning: 'Ban co du nguon luc de bat dau.',
      reversedMeaning: 'Ban dang phan tan nang luong.',
      description: 'La bai cua hanh dong va y chi.',
      group: 'major',
    },
    orientation: 'upright',
    position: 'Hien tai',
    revealed: true,
  },
];

describe('readingSession', () => {
  it('creates a serializable reading payload from drawn cards', () => {
    const storedReading = createStoredReading('one-card', 'Mot La', mockDrawnCards);

    expect(storedReading.spreadType).toBe('one-card');
    expect(storedReading.spreadName).toBe('Mot La');
    expect(storedReading.drawnCards).toHaveLength(1);
    expect(storedReading.drawnCards[0]).toMatchObject({
      cardId: 1,
      cardName: 'The Magician',
      position: 'Hien tai',
      orientation: 'upright',
    });
  });

  it('builds a readable share summary', () => {
    const storedReading = createStoredReading('one-card', 'Mot La', mockDrawnCards);
    const summary = buildReadingShareText(storedReading, 'Tin vao kha nang chu dong cua ban.');

    expect(summary).toContain('Astral Arcana');
    expect(summary).toContain('Hien tai: The Magician');
    expect(summary).toContain('AI:');
    expect(summary).toContain('Tin vao kha nang chu dong cua ban.');
  });
});
