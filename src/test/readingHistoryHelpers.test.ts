import { beforeEach, describe, expect, it } from 'vitest';
import type { DrawnCard, ReadingHistory } from '@/data/types';
import { createStoredReading } from '@/lib/readingSession';
import { getReadingHistory, upsertReadingHistory } from '@/hooks/useTarotReading';

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

function buildHistoryEntry(overrides?: Partial<ReadingHistory>): ReadingHistory {
  const storedReading = createStoredReading('one-card', 'Mot La', mockDrawnCards);

  return {
    id: 'local-reading-1',
    date: storedReading.createdAt,
    spreadType: storedReading.spreadType,
    spreadName: storedReading.spreadName,
    aiInterpretation: null,
    drawnCards: storedReading.drawnCards.map((card) => ({
      cardId: card.cardId,
      cardName: card.cardName,
      orientation: card.orientation,
      position: card.position,
    })),
    ...overrides,
  };
}

describe('reading history helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores a local history entry without AI text and normalizes it to null', () => {
    upsertReadingHistory(buildHistoryEntry({ aiInterpretation: undefined }));

    expect(getReadingHistory()).toEqual([
      expect.objectContaining({
        id: 'local-reading-1',
        aiInterpretation: null,
      }),
    ]);
  });

  it('updates an existing local history entry with AI text instead of duplicating it', () => {
    upsertReadingHistory(buildHistoryEntry());
    upsertReadingHistory(buildHistoryEntry({ aiInterpretation: 'Tin vao kha nang chu dong cua ban.' }));

    const history = getReadingHistory();
    expect(history).toHaveLength(1);
    expect(history[0].aiInterpretation).toBe('Tin vao kha nang chu dong cua ban.');
  });

  it('reads legacy local history data that does not include aiInterpretation', () => {
    const legacyEntry = buildHistoryEntry();
    delete (legacyEntry as { aiInterpretation?: string | null }).aiInterpretation;

    localStorage.setItem('tarot-reading-history', JSON.stringify([legacyEntry]));

    expect(getReadingHistory()).toEqual([
      expect.objectContaining({
        id: 'local-reading-1',
        aiInterpretation: null,
      }),
    ]);
  });
});
