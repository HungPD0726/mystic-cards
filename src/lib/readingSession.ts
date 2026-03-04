import { DrawnCard, Orientation, SpreadType } from '@/data/types';

export interface StoredReadingCard {
  cardId: number;
  cardName: string;
  cardSlug: string;
  orientation: Orientation;
  position: string;
  imagePath: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  description: string;
}

export interface StoredReading {
  spreadType: SpreadType;
  spreadName: string;
  createdAt: string;
  drawnCards: StoredReadingCard[];
}

const CURRENT_READING_KEY = 'tarot-current-reading';
const AUTO_AI_KEY = 'tarot-auto-ai';

export function createStoredReading(
  spreadType: SpreadType,
  spreadName: string,
  drawnCards: DrawnCard[],
): StoredReading {
  return {
    spreadType,
    spreadName,
    createdAt: new Date().toISOString(),
    drawnCards: drawnCards.map((drawnCard) => ({
      cardId: drawnCard.card.id,
      cardName: drawnCard.card.name,
      cardSlug: drawnCard.card.slug,
      orientation: drawnCard.orientation,
      position: drawnCard.position,
      imagePath: drawnCard.card.imagePath,
      keywords: drawnCard.card.keywords,
      uprightMeaning: drawnCard.card.uprightMeaning,
      reversedMeaning: drawnCard.card.reversedMeaning,
      description: drawnCard.card.description,
    })),
  };
}

export function saveCurrentReading(reading: StoredReading) {
  sessionStorage.setItem(CURRENT_READING_KEY, JSON.stringify(reading));
}

export function loadCurrentReading(): StoredReading | null {
  try {
    const raw = sessionStorage.getItem(CURRENT_READING_KEY);
    return raw ? (JSON.parse(raw) as StoredReading) : null;
  } catch {
    return null;
  }
}

export function setAutoAI(enabled: boolean) {
  if (enabled) {
    sessionStorage.setItem(AUTO_AI_KEY, 'true');
    return;
  }

  sessionStorage.removeItem(AUTO_AI_KEY);
}

export function consumeAutoAI(): boolean {
  const shouldAutoRun = sessionStorage.getItem(AUTO_AI_KEY) === 'true';
  sessionStorage.removeItem(AUTO_AI_KEY);
  return shouldAutoRun;
}

export function buildReadingShareText(reading: StoredReading, aiInterpretation?: string) {
  const cardSummary = reading.drawnCards
    .map((card) => `- ${card.position}: ${card.cardName} (${card.orientation === 'upright' ? 'Xuôi' : 'Ngược'})`)
    .join('\n');

  const interpretation = aiInterpretation?.trim()
    ? `\n\nLuận giải AI:\n${aiInterpretation.trim()}`
    : '';

  return `Astral Arcana • ${reading.spreadName}\n${cardSummary}${interpretation}`;
}
