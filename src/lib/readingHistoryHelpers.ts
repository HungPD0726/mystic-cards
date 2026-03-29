import { getCardById, getCardByName, getCardBySlug } from '@/data/cards';
import type { ReadingHistory, SpreadType } from '@/data/types';
import type { StoredReading, StoredReadingCard } from '@/lib/readingSession';

export interface DbReadingRecord {
  id: string;
  spread_type: string;
  spread_name: string;
  drawn_cards: unknown;
  ai_interpretation: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ReadingHistoryFilter {
  query: string;
  fromDate: string;
  toDate: string;
}

interface FilterableReadingEntry {
  spreadName: string;
  notes?: string | null;
  aiInterpretation?: string | null;
  date: string;
  drawnCards: Array<{
    cardName?: string;
    position?: string;
  }>;
}

const VALID_SPREAD_TYPES: SpreadType[] = [
  'one-card',
  'three-card',
  'yes-no',
  'love',
  'career',
  'daily',
  'celtic-cross',
  'horseshoe',
];

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toOptionalNote(value: unknown): string | null {
  const trimmed = toTrimmedString(value);
  return trimmed ? trimmed : null;
}

function toSpreadType(value: unknown): SpreadType | null {
  const spreadType = toTrimmedString(value);
  return VALID_SPREAD_TYPES.includes(spreadType as SpreadType) ? (spreadType as SpreadType) : null;
}

function slugifyCardName(cardName: string): string {
  return cardName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toCardKeywords(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function resolveCardRecord(cardRecord: unknown): StoredReadingCard | null {
  if (!cardRecord || typeof cardRecord !== 'object') {
    return null;
  }

  const rawCard = cardRecord as Record<string, unknown>;
  const cardId =
    typeof rawCard.cardId === 'number'
      ? rawCard.cardId
      : typeof rawCard.id === 'number'
        ? rawCard.id
        : null;
  const cardSlug = toTrimmedString(rawCard.cardSlug) || toTrimmedString(rawCard.slug);
  const cardName = toTrimmedString(rawCard.cardName) || toTrimmedString(rawCard.name);

  const baseCard =
    (cardId !== null ? getCardById(cardId) : undefined) ??
    (cardSlug ? getCardBySlug(cardSlug) : undefined) ??
    (cardName ? getCardByName(cardName) : undefined);

  const resolvedName = cardName || baseCard?.name || '';
  if (!resolvedName) {
    return null;
  }

  const orientation =
    rawCard.orientation === 'reversed' || rawCard.isReversed === true || rawCard.is_reversed === true || rawCard.is_reversed === 1
      ? 'reversed'
      : 'upright';
  const resolvedSlug = cardSlug || baseCard?.slug || slugifyCardName(resolvedName);
  const resolvedImagePath = toTrimmedString(rawCard.imagePath) || baseCard?.imagePath || '/placeholder.svg';
  const resolvedKeywords = toCardKeywords(rawCard.keywords);

  return {
    cardId: cardId ?? baseCard?.id ?? -1,
    cardName: resolvedName,
    cardSlug: resolvedSlug,
    orientation,
    position: toTrimmedString(rawCard.position) || 'Thông điệp',
    imagePath: resolvedImagePath,
    keywords: resolvedKeywords.length > 0 ? resolvedKeywords : baseCard?.keywords ?? [],
    uprightMeaning: toTrimmedString(rawCard.uprightMeaning) || baseCard?.uprightMeaning || '',
    reversedMeaning: toTrimmedString(rawCard.reversedMeaning) || baseCard?.reversedMeaning || '',
    description: toTrimmedString(rawCard.description) || baseCard?.description || '',
  };
}

function buildStoredReading(input: {
  spreadType: unknown;
  spreadName: unknown;
  createdAt: unknown;
  aiInterpretation?: unknown;
  notes?: unknown;
  drawnCards: unknown;
}): StoredReading | null {
  const spreadType = toSpreadType(input.spreadType);
  if (!spreadType) {
    return null;
  }

  const drawnCards = Array.isArray(input.drawnCards)
    ? input.drawnCards.map(resolveCardRecord).filter((card): card is StoredReadingCard => card !== null)
    : [];

  if (drawnCards.length === 0) {
    return null;
  }

  return {
    spreadType,
    spreadName: toTrimmedString(input.spreadName) || 'Trải bài',
    createdAt: toTrimmedString(input.createdAt) || new Date().toISOString(),
    aiInterpretation: toOptionalNote(input.aiInterpretation),
    notes: toOptionalNote(input.notes),
    drawnCards,
  };
}

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('vi');
}

export function buildStoredReadingFromHistoryEntry(entry: ReadingHistory): StoredReading | null {
  return buildStoredReading({
    spreadType: entry.spreadType,
    spreadName: entry.spreadName,
    createdAt: entry.date,
    aiInterpretation: entry.aiInterpretation,
    notes: entry.notes,
    drawnCards: entry.drawnCards,
  });
}

export function buildStoredReadingFromDbReading(reading: DbReadingRecord): StoredReading | null {
  return buildStoredReading({
    spreadType: reading.spread_type,
    spreadName: reading.spread_name,
    createdAt: reading.created_at,
    aiInterpretation: reading.ai_interpretation,
    notes: reading.notes,
    drawnCards: reading.drawn_cards,
  });
}

export function matchesReadingHistoryFilter(
  entry: FilterableReadingEntry,
  filter: ReadingHistoryFilter,
): boolean {
  const query = normalizeSearchText(filter.query);
  const fromDate = toTrimmedString(filter.fromDate);
  const toDate = toTrimmedString(filter.toDate);

  const entryDate = new Date(entry.date);
  if (fromDate) {
    const fromBoundary = new Date(`${fromDate}T00:00:00`);
    if (!Number.isNaN(fromBoundary.valueOf()) && entryDate < fromBoundary) {
      return false;
    }
  }

  if (toDate) {
    const toBoundary = new Date(`${toDate}T23:59:59`);
    if (!Number.isNaN(toBoundary.valueOf()) && entryDate > toBoundary) {
      return false;
    }
  }

  if (!query) {
    return true;
  }

  const haystack = [
    entry.spreadName,
    entry.notes ?? '',
    entry.aiInterpretation ?? '',
    ...entry.drawnCards.flatMap((card) => [card.cardName ?? '', card.position ?? '']),
  ]
    .join(' ')
    .toLocaleLowerCase('vi');

  return haystack.includes(query);
}
