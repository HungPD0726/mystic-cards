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
  aiInterpretation?: string | null;
  notes?: string | null;
  drawnCards: StoredReadingCard[];
}

const CURRENT_READING_KEY = 'tarot-current-reading';
const AUTO_AI_KEY = 'tarot-auto-ai';

export function createStoredReading(
  spreadType: SpreadType,
  spreadName: string,
  drawnCards: DrawnCard[],
  notes?: string | null,
): StoredReading {
  return {
    spreadType,
    spreadName,
    createdAt: new Date().toISOString(),
    aiInterpretation: null,
    notes: notes?.trim() ? notes.trim() : null,
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
    if (!raw) {
      return null;
    }

    const reading = JSON.parse(raw) as StoredReading;
    return {
      ...reading,
      aiInterpretation: reading.aiInterpretation ?? null,
      notes: reading.notes ?? null,
    };
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
  const focusText = reading.notes?.trim() ? `Câu hỏi tập trung: ${reading.notes.trim()}\n` : '';
  const cardSummary = reading.drawnCards
    .map((card) => `- ${card.position}: ${card.cardName} (${card.orientation === 'upright' ? 'Xuôi' : 'Ngược'})`)
    .join('\n');

  const interpretationText = aiInterpretation ?? reading.aiInterpretation ?? '';
  const interpretation = interpretationText.trim()
    ? `\n\nLuận giải AI:\n${interpretationText.trim()}`
    : '';

  return `Astral Arcana • ${reading.spreadName}\n${focusText}${cardSummary}${interpretation}`;
}
